'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { CalendarCheck, CheckCircle2, Clock, Loader2, MapPin, Send } from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type ScoreEntry = { examinerId: string; score: number; comments?: string; submittedAt?: string };

type DefenseSession = {
  id: string;
  projectId?: { title?: string; abstract?: string };
  scheduledAt: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scores: ScoreEntry[];
  examiners: { id: string; name?: string }[];
};

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled:  { label: 'Scheduled',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed:  { label: 'Completed',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function ExaminerDefenseSessionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, mutate } = useSWR('/examiner/defense-sessions', fetcher);
  const sessions: DefenseSession[] = data?.data ?? [];

  const [selected, setSelected]     = useState<DefenseSession | null>(null);
  const [score, setScore]           = useState('');
  const [comments, setComments]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openDialog = (session: DefenseSession) => {
    const existing = session.scores.find((s) => s.examinerId === user?.id);
    setScore(existing ? String(existing.score) : '');
    setComments(existing?.comments ?? '');
    setSelected(session);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast({ variant: 'destructive', title: 'Invalid score', description: 'Score must be between 0 and 100.' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/examiner/defense-sessions/${selected.id}/score`, {
        score: numScore,
        comments,
      });
      await mutate();
      toast({ title: 'Score submitted', description: `Score of ${numScore} recorded for "${selected.projectId?.title ?? 'project'}".` });
      setSelected(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Submission failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="examiner">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Defense Sessions</h1>
          <p className="text-muted-foreground">Review and score your assigned defense sessions</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-semibold text-lg">No defense sessions assigned yet.</h3>
              <p className="text-muted-foreground text-sm mt-1">The administrator will assign sessions when scheduled.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => {
              const cfg       = statusConfig[session.status] ?? statusConfig.scheduled;
              const myScore   = session.scores.find((s) => s.examinerId === user?.id);
              const canScore  = session.status === 'scheduled';

              return (
                <Card key={session.id} className="hover:shadow-md transition-all hover:border-rose-200 flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                          <CalendarCheck className="h-5 w-5 text-rose-600" />
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

                  <CardContent className="flex-1 space-y-4">
                    {session.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {session.location}
                      </p>
                    )}

                    {session.projectId?.abstract && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{session.projectId.abstract}</p>
                    )}

                    {myScore ? (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          Your score: {myScore.score}/100
                        </div>
                        {myScore.comments && (
                          <p className="text-xs text-emerald-600 line-clamp-2">{myScore.comments}</p>
                        )}
                        {myScore.submittedAt && (
                          <p className="text-xs text-muted-foreground">
                            Submitted {new Date(myScore.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      canScore && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 font-medium">
                          Score not yet submitted
                        </div>
                      )
                    )}

                    {canScore && (
                      <Button
                        className="w-full gap-2 bg-rose-600 hover:bg-rose-700"
                        onClick={() => openDialog(session)}
                      >
                        <Send className="h-4 w-4" />
                        {myScore ? 'Update Score' : 'Submit Score'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Score submission dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-rose-600" />
              Submit Evaluation Score
            </DialogTitle>
            <DialogDescription>
              {selected?.projectId?.title && (
                <span className="block mt-1 font-semibold text-foreground">{selected.projectId.title}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-semibold">Score (0 – 100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 78"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Comments <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                placeholder="Evaluation remarks..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="resize-none min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 gap-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
