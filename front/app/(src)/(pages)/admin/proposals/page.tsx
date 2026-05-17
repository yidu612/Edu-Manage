'use client';

import { useState, useMemo } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tabs, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  FileText, Search, CheckCircle, XCircle, Clock, Eye, Loader2,
  GraduationCap, Building2, Calendar, Paperclip, Download, AlignLeft,
  FolderOpen, ArrowRight, Layers,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type ProjectGroup = {
  _id: string;
  name: string;
  academicYear?: string;
  stages: { order: number; name: string; deadline: string }[];
  isLocked: boolean;
};

type Attachment = { name: string; url: string; type: string; size: number };

type Proposal = {
  _id: string;
  id: string;
  title: string;
  abstract?: string;
  objectives?: string;
  methodology?: string;
  expectedOutcomes?: string;
  department?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  student?: { _id: string; fullName: string; email: string; department?: string };
  teacher?: { _id: string; fullName: string; email: string } | null;
  attachments: Attachment[];
  createdAt: string;
  projectId?: { _id: string; title: string; status: string; groupId?: string | null } | null;
};

function getInitials(name: string = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function formatBytes(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  draft:    'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:  <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  draft:    <FileText className="h-3 w-3" />,
};

export default function AdminProposalsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState<'approved' | 'rejected' | null>(null);

  const [groupId, setGroupId] = useState('');

  const { data, isLoading } = useSWR('/proposals', fetcher);
  const { data: groupsData } = useSWR('/admin/groups', fetcher);
  const proposals: Proposal[] = data?.data ?? [];
  const groups: ProjectGroup[] = groupsData?.data ?? [];

  const stats = useMemo(() => ({
    total:    proposals.length,
    pending:  proposals.filter((p) => p.status === 'pending').length,
    approved: proposals.filter((p) => p.status === 'approved').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
  }), [proposals]);

  const filtered = useMemo(() => proposals.filter((p) => {
    const matchesTab = tab === 'all' || p.status === tab;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.student?.fullName ?? '').toLowerCase().includes(q) ||
      (p.department ?? '').toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  }), [proposals, tab, search]);

  const openDetail = (p: Proposal) => {
    setSelected(p);
    setComment('');
    setGroupId('');
    setSubmitting(null);
  };

  const projectAlreadyHasGroup = !!(selected?.projectId?.groupId);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    if (status === 'approved' && !groupId && !projectAlreadyHasGroup) {
      toast({ variant: 'destructive', title: 'Group required', description: 'Select a Project Group before approving.' });
      return;
    }
    setSubmitting(status);
    try {
      await api.put(`/proposals/${selected._id}/review`, {
        status,
        comment: comment.trim() || undefined,
        groupId: status === 'approved' ? groupId : undefined,
      });
      toast({
        title: status === 'approved' ? 'Proposal Approved' : 'Proposal Rejected',
        description: `"${selected.title}" has been ${status}.`,
      });
      globalMutate('/proposals');
      setSelected(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Student Proposals
          </h1>
          <p className="text-muted-foreground mt-1">Review and approve or reject submitted proposals</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Total
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Approved
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">{stats.approved}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-red-50/50 border-red-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-red-700 font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Rejected
              </CardDescription>
              <CardTitle className="text-3xl text-red-900">{stats.rejected}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Table card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlignLeft className="h-5 w-5 text-primary" /> All Proposals
                </CardTitle>
                <CardDescription>Click a row to review details and take action</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search title, student…"
                  className="pl-10 rounded-full w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="mt-2">
              <TabsList>
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
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
                {proposals.length === 0 ? 'No proposals submitted yet.' : 'No proposals match your filter.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[260px]">Title</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p._id} className="hover:bg-muted/50 cursor-pointer" onClick={() => openDetail(p)}>
                        <TableCell>
                          <p className="font-medium line-clamp-1">{p.title}</p>
                          {p.abstract && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.abstract}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.student ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(p.student.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm">{p.student.fullName}</p>
                                <p className="text-xs text-muted-foreground">{p.student.email}</p>
                              </div>
                            </div>
                          ) : <span className="text-muted-foreground text-sm">—</span>}
                        </TableCell>
                        <TableCell>
                          {p.department ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {p.department}
                            </div>
                          ) : <span className="text-muted-foreground text-sm">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`gap-1 ${STATUS_STYLES[p.status] ?? STATUS_STYLES.draft}`}>
                            {STATUS_ICONS[p.status]}
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.projectId ? (
                            <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              <FolderOpen className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(p.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full gap-1 h-8"
                            onClick={() => openDetail(p)}
                          >
                            <Eye className="h-3 w-3" /> Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail / Review Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg leading-snug pr-8">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3 flex-wrap">
                  {selected.student && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {selected.student.fullName}
                    </span>
                  )}
                  {selected.department && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {selected.department}
                    </span>
                  )}
                  <Badge variant="outline" className={`gap-1 ${STATUS_STYLES[selected.status]}`}>
                    {STATUS_ICONS[selected.status]}
                    {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Abstract */}
                {selected.abstract && (
                  <Section label="Abstract" text={selected.abstract} />
                )}

                {/* Objectives */}
                {selected.objectives && (
                  <Section label="Objectives" text={selected.objectives} />
                )}

                {/* Methodology */}
                {selected.methodology && (
                  <Section label="Methodology" text={selected.methodology} />
                )}

                {/* Expected Outcomes */}
                {selected.expectedOutcomes && (
                  <Section label="Expected Outcomes" text={selected.expectedOutcomes} />
                )}

                {/* Attachments */}
                {selected.attachments.length > 0 && (
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5" /> Attachments
                    </p>
                    {selected.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors"
                      >
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{att.name}</p>
                          {att.size > 0 && (
                            <p className="text-xs text-muted-foreground">{formatBytes(att.size)}</p>
                          )}
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Review comment + action — only for pending proposals */}
                {selected.status === 'pending' && (
                  <div className="rounded-xl border p-4 space-y-3 bg-muted/20">
                    <p className="text-sm font-semibold">Review Decision</p>

                    {/* Group selector */}
                    {projectAlreadyHasGroup ? (
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 flex items-center gap-2 text-sm text-blue-700">
                        <Layers className="h-4 w-4 shrink-0" />
                        <span>Project already has a group assigned — stage 1 will be auto-completed on approval.</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" /> Project Group <span className="text-destructive ml-0.5">*</span>
                        </label>
                        <Select value={groupId} onValueChange={setGroupId}>
                          <SelectTrigger className="rounded-xl text-sm">
                            <SelectValue placeholder="Select a project group…" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No groups available — create one first
                              </SelectItem>
                            ) : groups.map((g) => (
                              <SelectItem key={g._id} value={g._id}>
                                {g.name}{g.academicYear ? ` (${g.academicYear})` : ''} — {g.stages.length} stages
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Textarea
                      placeholder="Optional: add a comment or feedback for the student…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="resize-none rounded-xl min-h-[80px] text-sm"
                    />
                    <div className="flex gap-2 pt-1">
                      <Button
                        className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                        onClick={() => handleReview('approved')}
                        disabled={!!submitting || (!groupId && !projectAlreadyHasGroup)}
                      >
                        {submitting === 'approved'
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <CheckCircle className="h-4 w-4" />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 rounded-full gap-2"
                        onClick={() => handleReview('rejected')}
                        disabled={!!submitting}
                      >
                        {submitting === 'rejected'
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <XCircle className="h-4 w-4" />}
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* Linked project badge */}
                {selected.projectId && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <FolderOpen className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">Active Project Created</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{selected.projectId.title}</p>
                      </div>
                    </div>
                    <a
                      href="/admin/assignments"
                      className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
                    >
                      Assign Advisor <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Already reviewed notice */}
                {selected.status !== 'pending' && (
                  <div className={`rounded-xl border p-4 text-sm font-medium flex items-center gap-2
                    ${selected.status === 'approved'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'}`}
                  >
                    {selected.status === 'approved'
                      ? <CheckCircle className="h-4 w-4 shrink-0" />
                      : <XCircle className="h-4 w-4 shrink-0" />}
                    This proposal has already been{' '}
                    <span className="font-semibold">{selected.status}</span>.
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" className="rounded-full" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border p-4 space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  );
}
