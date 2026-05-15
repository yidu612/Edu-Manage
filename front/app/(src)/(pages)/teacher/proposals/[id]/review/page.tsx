"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Users, MessageSquare, Sparkles, CheckCircle2, XCircle, AlertTriangle, Send } from "lucide-react";
import { AICheckerModal } from "@/app/(src)/components/modals/AICheckerModal";
import { useToast } from "@/app/(src)/hooks/use-toast";

export default function ProposalReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showAIChecker, setShowAIChecker] = useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decisionType, setDecisionType] = useState<"approve" | "revise" | "reject">("approve");

  const handleDecision = () => {
    setShowDecisionDialog(false);
    toast({
        title: `Proposal ${decisionType}ed`,
        description: "The students have been notified of your decision.",
    });
    router.push("/teacher/dashboard");
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Student Performance Analytics</h1>
                <Badge className="bg-amber-100 text-amber-700 border-none">Pending Review</Badge>
              </div>
              <p className="text-muted-foreground font-medium">Submitted by Team Alpha • Jan 15, 2024</p>
            </div>
          </div>
          <Button 
            className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none gap-2 shadow-none"
            onClick={() => setShowAIChecker(true)}
          >
            <Sparkles className="h-4 w-4" />
            AI Content Check
          </Button>
        </div>

        {/* Floating Decision Bar */}
        <Card className="border-emerald-200 bg-emerald-50/30 backdrop-blur sticky top-20 z-10 shadow-lg shadow-emerald-900/5">
          <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-emerald-800">Ready to finalize your review?</div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full border-red-200 text-red-600 bg-white" onClick={() => { setDecisionType("reject"); setShowDecisionDialog(true); }}>
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
              <Button variant="outline" className="rounded-full border-amber-200 text-amber-600 bg-white" onClick={() => { setDecisionType("revise"); setShowDecisionDialog(true); }}>
                <AlertTriangle className="h-4 w-4 mr-2" /> Request Revision
              </Button>
              <Button className="rounded-full bg-primary px-8" onClick={() => { setDecisionType("approve"); setShowDecisionDialog(true); }}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Proposal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-full w-fit mb-8">
            <TabsTrigger value="details" className="rounded-full px-8 gap-2"><FileText className="h-4 w-4" /> Proposal</TabsTrigger>
            <TabsTrigger value="team" className="rounded-full px-8 gap-2"><Users className="h-4 w-4" /> The Team</TabsTrigger>
            <TabsTrigger value="discussion" className="rounded-full px-8 gap-2"><MessageSquare className="h-4 w-4" /> Discussion</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="border-none shadow-sm p-6 bg-card/50">
              <h3 className="text-xl font-bold mb-4">Abstract</h3>
              <p className="text-muted-foreground leading-relaxed">
                This project aims to develop an AI-powered system that analyzes student 
                performance data to provide personalized learning recommendations...
              </p>
            </Card>
            {/* Add more cards for Objectives, Methodology, etc. here */}
          </TabsContent>

          <TabsContent value="discussion">
             {/* Discussion Thread Logic */}
             <Card className="border-none shadow-sm">
                <CardHeader><CardTitle>Comments</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-4">
                        <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
                        <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex-1">
                            <p className="text-sm font-bold">John Doe (Student)</p>
                            <p className="text-sm mt-1">We have updated the data safeguards as requested.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Textarea placeholder="Write a message to the students..." className="rounded-2xl" />
                        <Button size="icon" className="rounded-full h-12 w-12 bg-primary"><Send className="h-5 w-5" /></Button>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AICheckerModal open={showAIChecker} onOpenChange={setShowAIChecker} />

      {/* Decision Confirmation Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Decision: {decisionType}</DialogTitle>
            <DialogDescription>Please provide final comments before submitting this decision.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Final feedback for students..." className="min-h-[150px] rounded-2xl" />
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setShowDecisionDialog(false)}>Cancel</Button>
            <Button className="rounded-full px-8" onClick={handleDecision}>Confirm & Notify Students</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}