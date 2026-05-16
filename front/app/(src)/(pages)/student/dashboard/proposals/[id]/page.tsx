"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, FileText, MessageSquare, Loader2, Paperclip } from "lucide-react";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: "Under Review",  className: "bg-amber-100 text-amber-700 border-none" },
  approved: { label: "Approved",      className: "bg-emerald-100 text-emerald-700 border-none" },
  rejected: { label: "Rejected",      className: "bg-red-100 text-red-700 border-none" },
  draft:    { label: "Draft",         className: "bg-gray-100 text-gray-700 border-none" },
};

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useSWR(`/proposals/${id}`, fetcher);
  const proposal = data?.data;

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-24 text-muted-foreground">Proposal not found.</div>
      </DashboardLayout>
    );
  }

  const statusMeta = statusConfig[proposal.status] ?? statusConfig.pending;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{proposal.title}</h1>
                <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
              </div>
              {proposal.teacher?.name && (
                <p className="text-muted-foreground font-medium">Supervisor: {proposal.teacher.name}</p>
              )}
            </div>
          </div>
          <Button
            className="rounded-full gap-2 px-6 h-11"
            onClick={() => router.push(`/student/dashboard/proposals/${id}/edit`)}
          >
            <Edit className="h-4 w-4" /> Edit Proposal
          </Button>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-full mb-8">
            <TabsTrigger value="details" className="rounded-full px-8 gap-2"><FileText className="h-4 w-4" /> Details</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-full px-8 gap-2"><MessageSquare className="h-4 w-4" /> Feedback</TabsTrigger>
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
            {proposal.attachments?.length > 0 && (
              <Card className="border-none shadow-sm p-6 bg-card/50">
                <h3 className="text-xl font-bold mb-4">Attachments</h3>
                <div className="space-y-2">
                  {proposal.attachments.map((a: { name: string; url: string }, i: number) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      <Paperclip className="h-4 w-4" />{a.name}
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="feedback">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-6">
                {proposal.feedbackList?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No feedback yet.</p>
                ) : (
                  proposal.feedbackList?.map((fb: { id: string; teacher?: { name?: string }; sections?: Array<{ comments: string }>; status: string; createdAt: string }, i: number) => (
                    <div key={i} className="flex gap-4">
                      <Avatar><AvatarFallback>{fb.teacher?.name?.charAt(0) ?? "T"}</AvatarFallback></Avatar>
                      <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex-1">
                        <p className="text-sm font-bold">{fb.teacher?.name ?? "Supervisor"}</p>
                        <p className="text-sm mt-1">{fb.sections?.[0]?.comments ?? "Feedback received."}</p>
                        <Badge className="mt-2 text-xs capitalize">{fb.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
