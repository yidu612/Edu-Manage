'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR, { mutate as globalMutate } from 'swr';
import Link from 'next/link';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Layers, CheckCircle2, Clock, Lock, Upload, FileText, Download,
  ChevronLeft, Loader2, XCircle, AlertCircle, Send, ArrowRight,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Document = { _id: string; name: string; url: string; type: string; size: number };

type ReviewSub = {
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  reviewedBy?: { fullName: string };
};

type ProposalRef = {
  _id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  abstract?: string;
  objectives?: string;
};

type Stage = {
  _id: string;
  stageOrder: number;
  stageName: string;
  deadline: string;
  status: 'locked' | 'active' | 'submitted' | 'advisor_approved' | 'advisor_rejected' | 'admin_rejected' | 'completed';
  submissionNotes?: string;
  submittedAt?: string;
  documents: Document[];
  advisorReview: ReviewSub;
  adminReview: ReviewSub;
  proposalId?: ProposalRef | null;
};

type ProjectInfo = {
  title: string;
  status: string;
  group?: { name?: string; academicYear?: string };
};

const STAGE_STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  locked:           { label: 'Locked',            cls: 'bg-gray-100 text-gray-500',     icon: <Lock className="h-3.5 w-3.5" /> },
  active:           { label: 'Active',             cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  submitted:        { label: 'Submitted',          cls: 'bg-blue-100 text-blue-700',     icon: <Clock className="h-3.5 w-3.5" /> },
  advisor_approved: { label: 'Advisor Approved',   cls: 'bg-sky-100 text-sky-700',       icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  advisor_rejected: { label: 'Needs Revision',     cls: 'bg-amber-100 text-amber-700',   icon: <AlertCircle className="h-3.5 w-3.5" /> },
  admin_rejected:   { label: 'Returned by Admin',  cls: 'bg-red-100 text-red-700',       icon: <XCircle className="h-3.5 w-3.5" /> },
  completed:        { label: 'Completed',          cls: 'bg-purple-100 text-purple-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

function formatBytes(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudentStagesPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data, isLoading } = useSWR(`/projects/${id}/stages`, fetcher);
  const stages: Stage[] = data?.data ?? [];
  const project: ProjectInfo | null = data?.project ?? null;

  const [submitting, setSubmitting] = useState<Stage | null>(null);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const openSubmit = (s: Stage) => { setSubmitting(s); setNotes(''); setFile(null); };

  const handleSubmit = async () => {
    if (!submitting) return;
    if (!notes.trim() && !file) {
      toast({ variant: 'destructive', title: 'Provide notes or upload a file.' });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('notes', notes.trim());
      if (file) fd.append('stageFile', file);

      await api.post(`/projects/${id}/stages/${submitting.stageOrder}/submit`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Stage submitted', description: `${submitting.stageName} is now awaiting advisor review.` });
      globalMutate(`/projects/${id}/stages`);
      setSubmitting(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Submission failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setSaving(false);
    }
  };

  const submittableStatuses = new Set(['active', 'advisor_rejected', 'admin_rejected']);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/student/dashboard/projects" className="hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> My Projects
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{project?.title ?? 'Project'}</span>
          <span>/</span>
          <span>Stages</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            Stage Progress
          </h1>
          {project?.group && (
            <p className="text-muted-foreground mt-1">
              {project.group.name}{project.group.academicYear ? ` · ${project.group.academicYear}` : ''}
            </p>
          )}
        </div>

        {/* Stages */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : stages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No stages found. This project may not be assigned to a group yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-10 bottom-4 w-px bg-border hidden sm:block" />

            <div className="space-y-4">
              {stages.map((stage) => {
                const meta = STAGE_STATUS_META[stage.status] ?? STAGE_STATUS_META.locked;
                const canSubmit = submittableStatuses.has(stage.status);
                const isPast = stage.status === 'completed';
                const isLocked = stage.status === 'locked';

                return (
                  <Card
                    key={stage._id}
                    className={`relative sm:ml-16 transition-all ${isLocked ? 'opacity-60' : ''}`}
                  >
                    {/* Circle on the timeline */}
                    <div className={`absolute -left-10 top-5 hidden sm:flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold
                      ${isPast ? 'bg-purple-100 border-purple-400 text-purple-700' :
                        isLocked ? 'bg-gray-100 border-gray-300 text-gray-400' :
                        'bg-primary/10 border-primary text-primary'}`}
                    >
                      {stage.stageOrder}
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">{stage.stageName}</span>
                          <Badge variant="outline" className={`gap-1 text-xs ${meta.cls}`}>
                            {meta.icon} {meta.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          Deadline: {new Date(stage.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {/* ── Stage 1: Proposal Submission — show proposal data ── */}
                      {stage.stageOrder === 1 ? (
                        <ProposalStageCard stage={stage} projectId={id} />
                      ) : (
                        <>
                          {/* Submission notes */}
                          {stage.submissionNotes && (
                            <div className="rounded-lg bg-muted/40 border p-3">
                              <p className="text-xs text-muted-foreground mb-1 font-medium">Your notes</p>
                              <p className="text-sm whitespace-pre-wrap">{stage.submissionNotes}</p>
                            </div>
                          )}

                          {/* Uploaded documents */}
                          {stage.documents.length > 0 && (
                            <div className="space-y-1.5">
                              {stage.documents.map((doc) => (
                                <a
                                  key={doc._id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-lg border p-2 hover:bg-muted/40 transition-colors"
                                >
                                  <FileText className="h-4 w-4 text-primary shrink-0" />
                                  <span className="text-sm flex-1 truncate">{doc.name}</span>
                                  {doc.size > 0 && (
                                    <span className="text-xs text-muted-foreground">{formatBytes(doc.size)}</span>
                                  )}
                                  <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Review feedback */}
                          {stage.advisorReview?.status === 'rejected' && stage.advisorReview.feedback && (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                              <p className="text-xs font-semibold text-amber-700 mb-1">Advisor Feedback</p>
                              <p className="text-sm text-amber-900">{stage.advisorReview.feedback}</p>
                            </div>
                          )}
                          {stage.adminReview?.status === 'rejected' && stage.adminReview.feedback && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                              <p className="text-xs font-semibold text-red-700 mb-1">Admin Feedback</p>
                              <p className="text-sm text-red-900">{stage.adminReview.feedback}</p>
                            </div>
                          )}

                          {/* Action button */}
                          {canSubmit && (
                            <Button
                              className="gap-2 rounded-xl h-9 text-sm"
                              size="sm"
                              onClick={() => openSubmit(stage)}
                            >
                              <Send className="h-4 w-4" />
                              {stage.status === 'active' ? 'Submit Stage' : 'Resubmit Stage'}
                            </Button>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Submit Stage Dialog */}
      <Dialog open={!!submitting} onOpenChange={(o) => { if (!o) setSubmitting(null); }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          {submitting && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Submit: {submitting.stageName}
                </DialogTitle>
                <DialogDescription>
                  Add notes and/or upload a file. Both advisor and admin must approve before the next stage unlocks.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <Textarea
                    placeholder="Describe what you've completed in this stage…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none rounded-xl min-h-[100px] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Upload File (optional)</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center gap-2 cursor-pointer rounded-xl border border-dashed p-3 hover:bg-muted/40 transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate">
                        {file ? file.name : 'Click to select a file…'}
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {file && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0 text-muted-foreground"
                        onClick={() => setFile(null)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setSubmitting(null)}>
                  Cancel
                </Button>
                <Button
                  className="rounded-full gap-2"
                  onClick={handleSubmit}
                  disabled={saving || (!notes.trim() && !file)}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// ── Proposal card rendered inside Stage 1 ────────────────────────────────────

const PROPOSAL_STATUS_META: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Under Review', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Approved',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected',     cls: 'bg-red-100 text-red-700 border-red-200' },
  draft:    { label: 'Draft',        cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function ProposalStageCard({ stage, projectId }: { stage: Stage; projectId: string }) {
  const proposal = stage.proposalId;

  if (!proposal) {
    return (
      <div className="rounded-xl border border-dashed p-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          No proposal has been submitted for this project yet.
        </p>
        <Link
          href={`/student/dashboard/proposals/new?projectId=${projectId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <FileText className="h-4 w-4" /> Submit Proposal <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const meta = PROPOSAL_STATUS_META[proposal.status] ?? PROPOSAL_STATUS_META.draft;

  return (
    <div className="space-y-3">
      {/* Proposal summary card */}
      <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-sm">{proposal.title}</span>
          </div>
          <Badge variant="outline" className={`text-xs gap-1 ${meta.cls}`}>
            {meta.label}
          </Badge>
        </div>
        {proposal.abstract && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{proposal.abstract}</p>
        )}
      </div>

      {/* Status-specific guidance */}
      {proposal.status === 'approved' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          Proposal approved — this stage is complete. Proceed to the next stage.
        </div>
      )}
      {proposal.status === 'pending' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 flex items-start gap-2">
          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
          Proposal is under review by your advisor and admin. No action required yet.
        </div>
      )}
      {proposal.status === 'rejected' && (
        <div className="space-y-2">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Proposal was not approved. Revise and resubmit to continue.
          </div>
          <Link
            href={`/student/dashboard/proposals/new?projectId=${projectId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Send className="h-4 w-4" /> Resubmit Proposal <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Link to full proposals page */}
      <Link
        href="/student/dashboard/proposals"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        View in Proposals <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
