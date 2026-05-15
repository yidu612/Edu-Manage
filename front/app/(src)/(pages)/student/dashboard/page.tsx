"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { StatsCard } from "@/app/(src)/components/dashboard/StatsCard";
import { ProposalCard } from "@/app/(src)/components/dashboard/ProposalCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Bell,
  ArrowRight,
} from "lucide-react";

const stats = [
  { title: "Total Proposals", value: 4, icon: FileText, description: "All time submissions" },
  { title: "Approved", value: 2, icon: CheckCircle, trend: { value: 50, isPositive: true } },
  { title: "Pending Review", value: 1, icon: Clock, description: "Awaiting feedback" },
  { title: "Needs Revision", value: 1, icon: AlertCircle, description: "Action required" },
];

const recentProposals = [
  {
    id: "1",
    title: "AI-Powered Analytics",
    description: "Machine learning system for performance prediction.",
    status: "approved" as const,
    date: "Dec 15, 2024",
    teamSize: 4,
    department: "Computer Science",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <DashboardLayout role="student">
      {/* 
         1. Added a wrapper with max-width to prevent stretching on huge screens.
         2. Added standard padding (p-4 for mobile, p-8 for desktop).
         3. Used space-y-8 to create consistent vertical flow.
      */}
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8 max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Welcome back, John
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Here&apos;s an overview of your project proposals.
            </p>
          </div>

          <Button
            className="w-full sm:w-auto rounded-full shadow-lg shadow-primary/20"
            onClick={() => router.push("/student/dashboard/proposals/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </div>

        {/* Stats Grid - Adjusted gap for better spacing */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid gap-6 lg:grid-cols-7">

          {/* Left Column: Proposals (Takes up 4/7 or roughly 60% on desktop) */}
          <div className="space-y-6 lg:col-span-4 xl:col-span-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Recent Proposals</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => router.push("/student/dashboard/proposals")}
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              {recentProposals.map((proposal) => (
                <ProposalCard key={proposal.id} {...proposal} />
              ))}
              {/* Added a placeholder if empty to prevent layout collapse */}
              {recentProposals.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                  No proposals found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Notifications (Takes up 3/7 on desktop, stacks on mobile) */}
          <div className="space-y-6 lg:col-span-3 xl:col-span-2">
            <Card className="h-full border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Notifications
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs font-normal">
                    3 new
                  </Badge>
                </div>
                <CardDescription>
                  Latest updates on your submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Added dummy items to make the card feel less empty/weird */}
                <div className="grid gap-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm pb-3 border-b last:border-0 last:pb-0">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                      <div className="grid gap-1">
                        <p className="font-medium leading-none">Proposal Approved</p>
                        <p className="text-xs text-muted-foreground">Your proposal was approved by the coordinator.</p>
                        <p className="text-[10px] text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => router.push("/student/dashboard/notifications")}
                >
                  View all notifications
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}