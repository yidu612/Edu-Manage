"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, FileText, MessageSquare, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AICheckerModal } from "@/app/(src)/components/modals/AICheckerModal";
import { useToast } from "@/app/(src)/hooks/use-toast";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: "Pending Review",  className: "bg-amber-100 text-amber-700 border-none" },
  approved: { label: "Approved",        className: "bg-emerald-100 text-emerald-700 border-none" },
  rejected: { label: "Rejected",        className: "bg-red-100 text-red-700 border-none" },
  draft:    { label: "Draft",           className: "bg-gray-100 text-gray-700 border-none" },
};

export default function ProposalReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [showAIChecker, setShowAIChecker] = useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decisionType, setDecisionType] = useState<"approved" | "rejected">("approved");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR(`/proposals/${id}`, fetcher);
  const proposal = data?.data;

  const handleDecision = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/proposals/${id}/review`, { status: decisionType, comment });
      await mutate();
      setShowDecisionDialog(false);
      toast({
        title: `Proposal ${decisionType === "approved" ? "Approved" : "Rejected"}`,
        description: "The student has been notified of your decision.",
      });
      router.push("/teacher/dashboard/assigned-proposals");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit decision.";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout role="teacher">
        <div className="text-center py-24 text-muted-foreground">Proposal not found.</div>
      </DashboardLayout>
    );
  }

  const statusMeta = statusConfig[proposal.status] ?? statusConfig.pending;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{proposal.title}</h1>
                <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
              </div>
              {proposal.student?.name && (
                <p className="text-muted-foreground font-medium">
                  Submitted by {proposal.student.name} • {new Date(proposal.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <Button
            className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none gap-2 shadow-none"
            onClick={() => setShowAIChecker(true)}
          >
            <Sparkles className="h-4 w-4" />AI Content Check
          </Button>
        </div>

        {proposal.status === "pending" && (
          <Card className="border-emerald-200 bg-emerald-50/30 backdrop-blur sticky top-20 z-10 shadow-lg shadow-emerald-900/5">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-medium text-emerald-800">Ready to finalize your review?</div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="rounded-full border-red-200 text-red-600 bg-white"
                  onClick={() => { setDecisionType("rejected"); setShowDecisionDialog(true); }}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
                <Button
                  className="rounded-full bg-primary px-8"
                  onClick={() => { setDecisionType("approved"); setShowDecisionDialog(true); }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-full w-fit mb-8">
            <TabsTrigger value="details" className="rounded-full px-8 gap-2"><FileText className="h-4 w-4" /> Proposal</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-full px-8 gap-2"><MessageSquare className="h-4 w-4" /> Feedback History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {proposal.abstract && (
              <Card className="border-none shadow-sm p-6 bg-card/50">
                <h3 className="text-xl font-bold mb-4">Abstract</h3>
                <p className="text-muted-foreground leading-relaxed">{proposal.abstract}</p>
              </Card>
            )}
            {proposal.objectives && (
              <Card className="border-none shadow-sm p-6 bg-card/50">
                <h3 className="text-xl font-bold mb-4">Objectives</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{proposal.objectives}</p>
              </Card>
            )}
            {proposal.methodology && (
              <Card className="border-none shadow-sm p-6 bg-card/50">
                <h3 className="text-xl font-bold mb-4">Methodology</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{proposal.methodology}</p>
              </Card>
            )}
            {!proposal.abstract && !proposal.objectives && !proposal.methodology && (
              <Card className="border-none shadow-sm p-6 bg-card/50">
                <p className="text-muted-foreground">No detailed content provided.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="feedback">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle>Previous Feedback</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {proposal.feedbackList?.length === 0 ? (
                  <p className="text-muted-foreground">No feedback submitted yet.</p>
                ) : (
                  proposal.feedbackList?.map((fb: { id: string; teacher?: { name?: string }; sections?: Array<{ comments: string }>; status: string }, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50 space-y-1">
                      <p className="text-sm font-semibold">{fb.teacher?.name ?? "Reviewer"}</p>
                      <p className="text-sm text-muted-foreground">{fb.sections?.[0]?.comments}</p>
                      <Badge className="text-xs capitalize">{fb.status}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AICheckerModal open={showAIChecker} onOpenChange={setShowAIChecker} />

      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {decisionType === "approved" ? "Approve Proposal" : "Reject Proposal"}
            </DialogTitle>
            <DialogDescription>Provide feedback before submitting this decision.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Comments for the student (optional)..."
            className="min-h-[150px] rounded-2xl"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setShowDecisionDialog(false)}>Cancel</Button>
            <Button
              className={`rounded-full px-8 ${decisionType === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}`}
              onClick={handleDecision}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm &amp; Notify Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
