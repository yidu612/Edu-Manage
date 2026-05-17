"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { StatsCard } from "@/app/(src)/components/dashboard/StatsCard";
import { ProposalCard } from "@/app/(src)/components/dashboard/ProposalCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertCircle, Plus, Bell, ArrowRight, FolderGit2, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type BackendStatus = "draft" | "pending" | "approved" | "rejected";

function mapStatus(s: string): "draft" | "under_review" | "approved" | "rejected" {
  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  if (s === "draft") return "draft";
  return "under_review";
}

function formatTime(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: propData } = useSWR("/proposals", fetcher);
  const { data: projectData } = useSWR("/projects", fetcher);
  const { data: notifData } = useSWR("/notifications", fetcher);

  const proposals: Array<{ id: string; title: string; status: BackendStatus; department?: string; abstract?: string; teacher?: { name?: string }; createdAt: string }> =
    propData?.data ?? [];

  const projects: Array<{ id: string; _id: string; title: string; status: string; mentorId?: { fullName?: string; name?: string } | null; createdAt: string }> =
    projectData?.data ?? [];

  const notifications: Array<{ id: string; notificationType: string; message: string; timestamp: string; isRead: boolean }> =
    notifData?.data ?? [];

  const stats = [
    { title: "Total Proposals", value: proposals.length, icon: FileText, description: "All time submissions" },
    { title: "Approved", value: proposals.filter((p) => p.status === "approved").length, icon: CheckCircle, trend: { value: proposals.length ? Math.round((proposals.filter((p) => p.status === "approved").length / proposals.length) * 100) : 0, isPositive: true } },
    { title: "Pending Review", value: proposals.filter((p) => p.status === "pending").length, icon: Clock, description: "Awaiting feedback" },
    { title: "Drafts", value: proposals.filter((p) => p.status === "draft").length, icon: AlertCircle, description: "Not yet submitted" },
  ];

  const recent = proposals.slice(0, 3);
  const unread = notifications.filter((n) => !n.isRead);

  return (
    <DashboardLayout role="student">
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Welcome back, {user?.name ?? "Student"}
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Active Projects */}
        {projects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-emerald-600" />
                Active Projects
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => router.push("/student/dashboard/projects")}
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((proj) => {
                const advisorName = proj.mentorId?.fullName ?? proj.mentorId?.name ?? null;
                const statusColors: Record<string, string> = {
                  submitted:    'bg-amber-100 text-amber-700',
                  under_review: 'bg-blue-100 text-blue-700',
                  approved:     'bg-emerald-100 text-emerald-700',
                  rejected:     'bg-red-100 text-red-700',
                  draft:        'bg-gray-100 text-gray-600',
                };
                return (
                  <Card
                    key={proj.id ?? proj._id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-emerald-100"
                    onClick={() => router.push('/student/dashboard/projects')}
                  >
                    <CardContent className="pt-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm line-clamp-2 leading-snug">{proj.title}</p>
                        <Badge className={`shrink-0 text-[10px] border-0 ${statusColors[proj.status] ?? statusColors.draft}`}>
                          {proj.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                        {advisorName ? <span className="font-medium text-gray-700">{advisorName}</span> : <span>No advisor yet</span>}
                      </div>
                      <Button
                        size="sm"
                        className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 h-8 text-xs gap-1"
                        onClick={(e) => { e.stopPropagation(); router.push('/student/dashboard/projects'); }}
                      >
                        <FolderGit2 className="h-3.5 w-3.5" /> Manage Project
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-7">
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
              {recent.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                  No proposals yet.{" "}
                  <button onClick={() => router.push("/student/dashboard/proposals/new")} className="underline">
                    Create one
                  </button>
                </div>
              ) : (
                recent.map((p) => (
                  <ProposalCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    description={p.abstract}
                    status={mapStatus(p.status)}
                    department={p.department}
                    supervisor={p.teacher?.name}
                    date={new Date(p.createdAt).toLocaleDateString()}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3 xl:col-span-2">
            <Card className="h-full border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Notifications
                  </CardTitle>
                  {unread.length > 0 && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {unread.length} new
                    </Badge>
                  )}
                </div>
                <CardDescription>Latest updates on your submissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="flex items-start gap-3 text-sm pb-3 border-b last:border-0 last:pb-0">
                      <div className={`h-2 w-2 mt-1.5 rounded-full shrink-0 ${n.isRead ? "bg-muted-foreground" : "bg-blue-500"}`} />
                      <div className="grid gap-1">
                        <p className="font-medium leading-none capitalize">{n.notificationType}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground">{formatTime(n.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No notifications yet.</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => router.push("/notifications")}
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
