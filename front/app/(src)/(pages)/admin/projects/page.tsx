'use client';

import { useState, useMemo } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tabs, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FolderGit2, Search, Layers, Loader2, GraduationCap, Calendar,
  FileText, CheckCircle, Clock, XCircle, AlertCircle, Eye,
  Link2, BookOpen,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Group = {
  _id: string;
  name: string;
  academicYear?: string;
  stages: { order: number; name: string; deadline: string }[];
  isLocked: boolean;
};

type Project = {
  _id: string;
  title: string;
  status: string;
  abstract?: string;
  createdAt: string;
  studentId?: { _id: string; fullName: string; email: string; department?: string } | null;
  mentorId?: { _id: string; fullName: string; email: string } | null;
  proposalId?: { _id: string; title: string; status: string } | null;
  groupId?: Group | null;
};

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  draft:        { label: 'Draft',          cls: 'bg-gray-100 text-gray-600 border-gray-200',       icon: <FileText className="h-3 w-3" /> },
  pending:      { label: 'Pending',        cls: 'bg-gray-100 text-gray-600 border-gray-200',       icon: <Clock className="h-3 w-3" /> },
  submitted:    { label: 'Proposal Review',cls: 'bg-amber-100 text-amber-700 border-amber-200',    icon: <Clock className="h-3 w-3" /> },
  active:       { label: 'Active',         cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle className="h-3 w-3" /> },
  under_review: { label: 'Final Review',   cls: 'bg-blue-100 text-blue-700 border-blue-200',       icon: <AlertCircle className="h-3 w-3" /> },
  completed:    { label: 'Completed',      cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: <CheckCircle className="h-3 w-3" /> },
  rejected:     { label: 'Rejected',       cls: 'bg-red-100 text-red-700 border-red-200',          icon: <XCircle className="h-3 w-3" /> },
  approved:     { label: 'Approved',       cls: 'bg-blue-100 text-blue-700 border-blue-200',       icon: <CheckCircle className="h-3 w-3" /> },
};

const STATUS_TABS = ['all', 'draft', 'submitted', 'active', 'under_review', 'completed'];

export default function AdminProjectsPage() {
  const { toast } = useToast();

  const { data, isLoading } = useSWR('/admin/projects', fetcher);
  const { data: groupsData } = useSWR('/admin/groups', fetcher);

  const projects: Project[] = data?.data ?? [];
  const groups: Group[] = groupsData?.data ?? [];

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [saving, setSaving] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const p of projects) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [projects]);

  const filtered = useMemo(() => projects.filter((p) => {
    const matchTab = tab === 'all' || p.status === tab;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.studentId?.fullName ?? '').toLowerCase().includes(q) ||
      (p.studentId?.email ?? '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  }), [projects, tab, search]);

  const openAssign = (p: Project) => {
    setSelected(p);
    setGroupId(p.groupId?._id ?? '');
    setAssigning(true);
  };

  const handleAssignGroup = async () => {
    if (!selected || !groupId) return;
    setSaving(true);
    try {
      await api.patch(`/admin/projects/${selected._id}/assign-group`, { groupId });
      toast({
        title: 'Group assigned',
        description: `"${selected.title}" is now tracking stages in the selected group.`,
      });
      globalMutate('/admin/projects');
      setAssigning(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to assign group.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FolderGit2 className="h-6 w-6 text-primary" />
            </div>
            All Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            View every student project, assign project groups, and track progress
          </p>
        </div>

        {/* Stats row */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {STATUS_TABS.map((s) => {
            const meta = STATUS_META[s] ?? { label: 'All', cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
            const count = counts[s] ?? 0;
            return (
              <Card
                key={s}
                className={`cursor-pointer transition-all border-2 ${tab === s ? 'border-primary/60 shadow-sm' : 'border-transparent'}`}
                onClick={() => setTab(s)}
              >
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardDescription className="text-xs font-medium capitalize">{s === 'all' ? 'All' : meta.label}</CardDescription>
                  <CardTitle className="text-2xl">{s === 'all' ? projects.length : count}</CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Table card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Projects</CardTitle>
                <CardDescription>
                  {filtered.length} project{filtered.length !== 1 ? 's' : ''} shown
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search title or student…"
                  className="pl-9 rounded-full w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Tabs value={tab} onValueChange={setTab} className="mt-2">
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="all">All ({counts.all ?? 0})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({counts.draft ?? 0})</TabsTrigger>
                <TabsTrigger value="submitted">Review ({counts.submitted ?? 0})</TabsTrigger>
                <TabsTrigger value="active">Active ({counts.active ?? 0})</TabsTrigger>
                <TabsTrigger value="under_review">Final ({counts.under_review ?? 0})</TabsTrigger>
                <TabsTrigger value="completed">Done ({counts.completed ?? 0})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderGit2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{projects.length === 0 ? 'No projects yet.' : 'No projects match your filter.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Project</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Advisor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => {
                      const meta = STATUS_META[p.status] ?? STATUS_META.draft;
                      return (
                        <TableRow key={p._id} className="hover:bg-muted/40">
                          <TableCell>
                            <p className="font-medium line-clamp-1">{p.title}</p>
                            {p.proposalId && (
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Proposal: {p.proposalId.status}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.studentId ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(p.studentId.fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm truncate">{p.studentId.fullName}</p>
                                  <p className="text-xs text-muted-foreground truncate">{p.studentId.email}</p>
                                </div>
                              </div>
                            ) : <span className="text-muted-foreground text-sm">—</span>}
                          </TableCell>
                          <TableCell>
                            {p.mentorId ? (
                              <div className="flex items-center gap-1 text-sm">
                                <GraduationCap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate max-w-[120px]">{p.mentorId.fullName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 text-xs ${meta.cls}`}>
                              {meta.icon} {meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {p.groupId ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Layers className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                <span className="truncate max-w-[120px]">{p.groupId.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No group</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(p.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full h-8 gap-1 text-xs"
                              onClick={() => openAssign(p)}
                            >
                              <Link2 className="h-3.5 w-3.5" />
                              {p.groupId ? 'Change Group' : 'Assign Group'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Group Dialog */}
      <Dialog open={assigning} onOpenChange={(o) => { if (!o) setAssigning(false); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> Assign Project Group
                </DialogTitle>
                <DialogDescription className="space-y-1">
                  <span className="font-medium text-foreground block">{selected.title}</span>
                  {selected.studentId && (
                    <span className="flex items-center gap-1 text-sm">
                      <GraduationCap className="h-4 w-4" /> {selected.studentId.fullName}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 space-y-4">
                {selected.groupId && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 flex items-center gap-2 text-sm text-blue-700">
                    <Layers className="h-4 w-4 shrink-0" />
                    Currently in: <span className="font-semibold">{selected.groupId.name}</span>
                    {selected.groupId.academicYear && (
                      <span className="text-blue-500">({selected.groupId.academicYear})</span>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Select Group</label>
                  <Select value={groupId} onValueChange={setGroupId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Choose a project group…" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          No groups available — create one first
                        </SelectItem>
                      ) : groups.map((g) => (
                        <SelectItem key={g._id} value={g._id}>
                          <div className="flex flex-col">
                            <span>{g.name}{g.academicYear ? ` (${g.academicYear})` : ''}</span>
                            <span className="text-xs text-muted-foreground">{g.stages.length} stages</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview selected group stages */}
                {groupId && (() => {
                  const g = groups.find((x) => x._id === groupId);
                  if (!g) return null;
                  return (
                    <div className="rounded-xl border p-3 space-y-1.5 bg-muted/20">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" /> Stage Preview
                      </p>
                      {g.stages.map((s) => (
                        <div key={s.order} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                              {s.order}
                            </span>
                            {s.name}
                          </div>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(s.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {selected.groupId && groupId && groupId !== selected.groupId._id && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Changing the group will <strong>delete existing stage records</strong> and create new ones from the selected group's template.
                    </span>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setAssigning(false)}>
                  Cancel
                </Button>
                <Button
                  className="rounded-full gap-2"
                  onClick={handleAssignGroup}
                  disabled={saving || !groupId || groupId === selected.groupId?._id}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                  {selected.groupId ? 'Reassign Group' : 'Assign Group'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
