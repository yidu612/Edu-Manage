'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  CalendarCheck, CheckCircle2, Clock, Loader2, MapPin, Plus, Trophy, Users, XCircle,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type ScoreEntry = { examinerId: string; score: number; comments?: string };

type DefenseSession = {
  _id: string;
  projectId?: { _id: string; title?: string; abstract?: string };
  scheduledAt: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  examiners: { _id: string; fullName?: string; email?: string }[];
  scores: ScoreEntry[];
  finalScore?: number;
};

type Project = { _id: string; title: string };
type Examiner = { _id: string; fullName?: string; email?: string };

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function AdminDefensePage() {
  const { toast } = useToast();

  const { data: sessionsData, isLoading, mutate } = useSWR('/admin/defense-sessions', fetcher);
  const { data: projectsData } = useSWR('/projects', fetcher);
  const { data: examinersData } = useSWR('/users/examiners', fetcher);

  const sessions: DefenseSession[] = sessionsData?.data ?? [];
  const projects: Project[] = projectsData?.data ?? [];
  const examiners: Examiner[] = examinersData?.data ?? [];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ projectId: '', scheduledAt: '', location: '', examiners: '' });
  const [submitting, setSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.projectId || !form.scheduledAt) {
      toast({ variant: 'destructive', title: 'Project and date/time are required' });
      return;
    }
    setSubmitting(true);
    try {
      const examinerIds = form.examiners
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post('/admin/defense-sessions', {
        projectId: form.projectId,
        scheduledAt: form.scheduledAt,
        location: form.location || undefined,
        examiners: examinerIds,
      });
      await mutate();
      setOpen(false);
      setForm({ projectId: '', scheduledAt: '', location: '', examiners: '' });
      toast({ title: 'Defense session scheduled' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalize = async (id: string) => {
    setFinalizing(id);
    try {
      await api.patch(`/admin/defense-sessions/${id}/finalize`);
      await mutate();
      toast({ title: 'Session finalized', description: 'Final score computed from all examiner scores.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setFinalizing(null);
    }
  };

  const scheduled = sessions.filter((s) => s.status === 'scheduled').length;
  const completed = sessions.filter((s) => s.status === 'completed').length;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Defense Sessions</h1>
            <p className="text-muted-foreground">Schedule and manage project defense evaluations.</p>
          </div>
          <Button className="gap-2 rounded-full" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Schedule Session
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Scheduled
              </p>
              <p className="text-3xl font-bold text-amber-900">{scheduled}</p>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </p>
              <p className="text-3xl font-bold text-emerald-900">{completed}</p>
            </CardHeader>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <p className="text-sm text-purple-700 font-medium flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" /> Total
              </p>
              <p className="text-3xl font-bold text-purple-900">{sessions.length}</p>
            </CardHeader>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-semibold text-lg">No defense sessions yet.</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Click "Schedule Session" to create the first one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => {
              const cfg = statusConfig[session.status] ?? statusConfig.scheduled;
              const avgScore = session.scores.length > 0
                ? Math.round(session.scores.reduce((s, e) => s + e.score, 0) / session.scores.length * 10) / 10
                : null;
              const canFinalize =
                session.status === 'scheduled' &&
                session.scores.length > 0 &&
                session.scores.length === session.examiners.length;

              return (
                <Card key={session._id} className="hover:shadow-md transition-all flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <CalendarCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold line-clamp-1">
                            {session.projectId?.title ?? 'Untitled Project'}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(session.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    {session.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {session.location}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {session.examiners.length === 0
                        ? 'No examiners assigned'
                        : session.examiners.map((e) => e.fullName ?? e.email ?? 'Examiner').join(', ')}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Scores: {session.scores.length}/{session.examiners.length}
                      </span>
                      {avgScore !== null && (
                        <span className="text-primary font-semibold">Avg: {avgScore}/100</span>
                      )}
                    </div>

                    {session.status === 'completed' && session.finalScore !== undefined && (
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 font-semibold">
                        <Trophy className="h-4 w-4" />
                        Final Score: {session.finalScore}/100
                      </div>
                    )}

                    {canFinalize && session.status === 'scheduled' && (
                      <Button
                        size="sm"
                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleFinalize(session._id)}
                        disabled={finalizing === session._id}
                      >
                        {finalizing === session._id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Finalize Session
                      </Button>
                    )}

                    {session.status === 'cancelled' && (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <XCircle className="h-3.5 w-3.5" /> Session cancelled
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Schedule Defense Session
            </DialogTitle>
            <DialogDescription>
              Assign a project, date/time, location, and examiners.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-semibold">Project</Label>
              <select
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Date &amp; Time</Label>
              <Input
                type="datetime-local"
                className="h-11 rounded-xl"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Location <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input
                placeholder="e.g. Room 301, Main Building"
                className="h-11 rounded-xl"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Examiners</Label>
              <select
                multiple
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setForm({ ...form, examiners: selected.join(',') });
                }}
              >
                {examiners.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.fullName ?? ex.email ?? ex._id}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple examiners.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
