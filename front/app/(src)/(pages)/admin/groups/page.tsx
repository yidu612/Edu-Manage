'use client';

import { useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Layers, Plus, Trash2, Loader2, Lock, Calendar, BookOpen,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Stage = { order: number; name: string; deadline: string };
type ProjectGroup = {
  _id: string;
  name: string;
  academicYear?: string;
  description?: string;
  stages: Stage[];
  isLocked: boolean;
  projectCount: number;
  createdAt: string;
};

const DEFAULT_STAGE_NAMES = [
  'Proposal Submission',
  'Chapter 2 – Literature Review',
  'Chapter 3 – Methodology',
  'Chapter 4 – Results',
  'Chapter 5 – Discussion',
  'Final Submission',
];

function emptyStage(order: number): Stage {
  return { order, name: DEFAULT_STAGE_NAMES[order - 1] ?? `Stage ${order}`, deadline: '' };
}

export default function AdminGroupsPage() {
  const { toast } = useToast();
  const { data, isLoading } = useSWR('/admin/groups', fetcher);
  const groups: ProjectGroup[] = data?.data ?? [];

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState<Stage[]>([emptyStage(1), emptyStage(2)]);

  const resetForm = () => {
    setName('');
    setAcademicYear('');
    setDescription('');
    setStages([emptyStage(1), emptyStage(2)]);
  };

  const addStage = () => {
    setStages((prev) => [...prev, emptyStage(prev.length + 1)]);
  };

  const removeStage = (index: number) => {
    setStages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const updateStage = (index: number, field: keyof Stage, value: string | number) => {
    setStages((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast({ variant: 'destructive', title: 'Name required' });
    if (stages.length < 2) return toast({ variant: 'destructive', title: 'At least 2 stages required' });
    for (const s of stages) {
      if (!s.name.trim()) return toast({ variant: 'destructive', title: 'All stages need a name' });
      if (!s.deadline) return toast({ variant: 'destructive', title: `Set deadline for "${s.name}"` });
    }
    setSaving(true);
    try {
      await api.post('/admin/groups', { name: name.trim(), academicYear: academicYear.trim(), description: description.trim(), stages });
      toast({ title: 'Group created', description: `"${name}" is ready to be assigned to projects.` });
      globalMutate('/admin/groups');
      setOpen(false);
      resetForm();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create group.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              Project Groups
            </h1>
            <p className="text-muted-foreground mt-1">Create stage templates and assign projects into cohorts</p>
          </div>
          <Button className="rounded-full gap-2 shrink-0" onClick={() => { resetForm(); setOpen(true); }}>
            <Plus className="h-4 w-4" /> New Group
          </Button>
        </div>

        {/* Groups list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No project groups yet</p>
              <p className="text-sm mt-1">Create a group to define stage templates and deadlines for a cohort of projects.</p>
              <Button className="mt-4 rounded-full gap-2" onClick={() => { resetForm(); setOpen(true); }}>
                <Plus className="h-4 w-4" /> Create First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((g) => (
              <Card key={g._id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-snug">{g.name}</CardTitle>
                      {g.academicYear && (
                        <CardDescription className="text-xs mt-0.5">{g.academicYear}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {g.isLocked && (
                        <Badge variant="outline" className="gap-1 text-xs bg-amber-50 text-amber-700 border-amber-200">
                          <Lock className="h-3 w-3" /> Locked
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <BookOpen className="h-3 w-3" /> {g.projectCount} project{g.projectCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  {g.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{g.description}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <div className="space-y-1.5">
                    {g.stages.map((s) => (
                      <div key={s.order} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {s.order}
                          </span>
                          <span className="text-sm">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(s.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> New Project Group
            </DialogTitle>
            <DialogDescription>
              Define the stage template and deadlines. Once a project is assigned, stages become immutable.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-muted-foreground">Group Name *</label>
                <Input
                  placeholder="e.g. BSc CS 2025 Cohort A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-muted-foreground">Academic Year</label>
                <Input
                  placeholder="e.g. 2024/2025"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
              <Textarea
                placeholder="Brief description of this cohort or group…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none rounded-xl min-h-[60px] text-sm"
              />
            </div>

            {/* Stage builder */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Stages * (min 2)</label>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full gap-1 h-7 text-xs"
                  onClick={addStage}
                  disabled={stages.length >= 8}
                >
                  <Plus className="h-3 w-3" /> Add Stage
                </Button>
              </div>

              <div className="space-y-2">
                {stages.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl border bg-muted/20">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {s.order}
                    </span>
                    <Input
                      placeholder={`Stage ${s.order} name`}
                      value={s.name}
                      onChange={(e) => updateStage(i, 'name', e.target.value)}
                      className="flex-1 rounded-lg h-8 text-sm"
                    />
                    <Input
                      type="date"
                      value={s.deadline}
                      onChange={(e) => updateStage(i, 'deadline', e.target.value)}
                      className="w-36 rounded-lg h-8 text-sm"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeStage(i)}
                      disabled={stages.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full gap-2" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
