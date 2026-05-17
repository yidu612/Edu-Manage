'use client';

import { useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ClipboardCheck, CheckCircle, XCircle, Calendar, FileText,
  Loader2, GraduationCap, Download,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Document = { _id: string; name: string; url: string; type: string; size: number };

type Stage = {
  _id: string;
  stageOrder: number;
  stageName: string;
  deadline: string;
  status: string;
  submissionNotes?: string;
  submittedAt?: string;
  documents: Document[];
  projectId: {
    _id: string;
    title: string;
    studentId: { fullName: string; email: string };
  };
};

function formatBytes(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TeacherStageReviewsPage() {
  const { toast } = useToast();
  const { data, isLoading } = useSWR('/projects/stages/pending', fetcher);
  const stages: Stage[] = data?.data ?? [];

  const [selected, setSelected] = useState<Stage | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState<'approved' | 'rejected' | null>(null);

  const openDetail = (s: Stage) => { setSelected(s); setFeedback(''); };

  const handleReview = async (decision: 'approved' | 'rejected') => {
    if (!selected) return;
    setSubmitting(decision);
    try {
      await api.patch(
        `/projects/${selected.projectId._id}/stages/${selected.stageOrder}/advisor-review`,
        { decision, feedback: feedback.trim() || undefined },
      );
      toast({
        title: decision === 'approved' ? 'Stage Approved' : 'Stage Returned',
        description: `${selected.stageName} ${decision === 'approved' ? 'approved — awaiting admin review.' : 'returned to student for revision.'}`,
      });
      globalMutate('/projects/stages/pending');
      setSelected(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            Stage Reviews
          </h1>
          <p className="text-muted-foreground mt-1">Review stage submissions from your assigned students</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submitted Stages</CardTitle>
            <CardDescription>
              {stages.length} stage{stages.length !== 1 ? 's' : ''} awaiting your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : stages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No stage submissions to review right now.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stage</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stages.map((s) => (
                      <TableRow key={s._id} className="hover:bg-muted/50 cursor-pointer" onClick={() => openDetail(s)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                              {s.stageOrder}
                            </span>
                            <span className="font-medium text-sm">{s.stageName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[180px] truncate">{s.projectId?.title ?? '—'}</TableCell>
                        <TableCell>
                          {s.projectId?.studentId && (
                            <div>
                              <p className="text-sm">{s.projectId.studentId.fullName}</p>
                              <p className="text-xs text-muted-foreground">{s.projectId.studentId.email}</p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(s.deadline).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {s.submittedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(s.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" className="rounded-full h-8 gap-1" onClick={() => openDetail(s)}>
                            <ClipboardCheck className="h-3 w-3" /> Review
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
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Stage {selected.stageOrder}: {selected.stageName}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> {selected.projectId?.title}
                  </span>
                  {selected.projectId?.studentId && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" /> {selected.projectId.studentId.fullName}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {selected.submissionNotes && (
                  <div className="rounded-xl border p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student Notes</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.submissionNotes}</p>
                  </div>
                )}

                {selected.documents.length > 0 && (
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitted Files</p>
                    {selected.documents.map((doc) => (
                      <a
                        key={doc._id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors"
                      >
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          {doc.size > 0 && <p className="text-xs text-muted-foreground">{formatBytes(doc.size)}</p>}
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="rounded-xl border p-4 space-y-3 bg-muted/20">
                  <p className="text-sm font-semibold">Your Review</p>
                  <Textarea
                    placeholder="Feedback for the student (required when rejecting)…"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="resize-none rounded-xl min-h-[80px] text-sm"
                  />
                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                      onClick={() => handleReview('approved')}
                      disabled={!!submitting}
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
                      Return for Revision
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="rounded-full" onClick={() => setSelected(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
