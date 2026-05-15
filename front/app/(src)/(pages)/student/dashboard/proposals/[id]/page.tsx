"use client";

import { useState } from "react";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, MessageSquare, FileText, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProposalDetailPage() {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">AI Student Analytics</h1>
                <Badge className="bg-amber-100 text-amber-700 border-none">Revision Requested</Badge>
              </div>
              <p className="text-muted-foreground font-medium">Supervisor: Dr. Sarah Johnson</p>
            </div>
          </div>
          <Button className="rounded-full gap-2 px-6 h-11" onClick={() => router.push("/student/dashboard/proposals/1/edit")}>
            <Edit className="h-4 w-4" /> Edit Proposal
          </Button>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-full mb-8">
            <TabsTrigger value="details" className="rounded-full px-8 gap-2"><FileText className="h-4 w-4" /> Details</TabsTrigger>
            <TabsTrigger value="discussion" className="rounded-full px-8 gap-2"><MessageSquare className="h-4 w-4" /> Discussion</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="border-none shadow-sm p-6 bg-card/50">
              <h3 className="text-xl font-bold mb-4">Abstract</h3>
              <p className="text-muted-foreground leading-relaxed">This project leverages ML to predict at-risk students...</p>
            </Card>
          </TabsContent>

          <TabsContent value="discussion">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex gap-4">
                  <Avatar><AvatarFallback>SJ</AvatarFallback></Avatar>
                  <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex-1">
                    <p className="text-sm font-bold">Dr. Sarah Johnson (Supervisor)</p>
                    <p className="text-sm mt-1">Please clarify your data anonymization techniques.</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Textarea placeholder="Reply to your supervisor..." className="rounded-2xl" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <Button size="icon" className="rounded-full h-12 w-12 bg-primary"><Send className="h-5 w-5" /></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}