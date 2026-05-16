'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { StatsCard } from '@/app/(src)/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText, ArrowRight, Clock, AlertCircle, CheckCircle2, Calendar,
  Users, Bell, Loader2, XCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Proposal = {
  id: string;
  title: string;
  status: string;
  student?: { id?: string; name?: string; fullName?: string; department?: string };
  createdAt: string;
};

type Notification = {
  id: string;
  notificationType: string;
  message: string;
  timestamp: string;
  isRead: boolean;
};

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

const statusConfig: Record<string, { label: string; className: string; Icon: typeof Clock }> = {
  pending:  { label: 'Pending Review', className: 'bg-amber-100 text-amber-700 border-amber-200',   Icon: Clock },
  approved: { label: 'Approved',       className: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  rejected: { label: 'Rejected',       className: 'bg-red-100 text-red-700 border-red-200',         Icon: XCircle },
  draft:    { label: 'Draft',          className: 'bg-gray-100 text-gray-700 border-gray-200',       Icon: FileText },
};

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: propData, isLoading } = useSWR('/proposals', fetcher);
  const { data: notifData } = useSWR('/notifications', fetcher);

  const proposals: Proposal[] = propData?.data ?? [];
  const notifications: Notification[] = notifData?.data ?? [];

  const stats = useMemo(() => ({
    pending:  proposals.filter((p) => p.status === 'pending').length,
    approved: proposals.filter((p) => p.status === 'approved').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
    total:    proposals.length,
  }), [proposals]);

  const recentProposals = proposals.slice(0, 5);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {user?.name ?? 'Teacher'}. Review and manage assigned proposals.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Pending Review" value={stats.pending} icon={Clock} />
          <StatsCard title="Approved"       value={stats.approved} icon={CheckCircle2} />
          <StatsCard title="Rejected"       value={stats.rejected} icon={AlertCircle} />
          <StatsCard title="Total Assigned" value={stats.total}    icon={FileText} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Proposals */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <CardTitle className="text-xl font-bold">Assigned Proposals</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Proposals waiting for your review</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex text-xs h-8 rounded-full"
                  onClick={() => router.push('/teacher/dashboard/assigned-proposals')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentProposals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                    <p className="font-semibold">No proposals assigned yet.</p>
                    <p className="text-sm mt-1">The admin will assign student proposals to you.</p>
                  </div>
                ) : (
                  <>
                    {recentProposals.map((item) => {
                      const cfg = statusConfig[item.status] ?? statusConfig.pending;
                      const studentName = item.student?.name ?? item.student?.fullName ?? '—';
                      return (
                        <div
                          key={item.id}
                          className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer"
                          onClick={() => router.push(`/teacher/proposals/${item.id}/review`)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                              <FileText className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm">{item.title}</h3>
                                <Badge variant="outline" className={`rounded-full text-xs ${cfg.className}`}>
                                  <cfg.Icon className="w-3 h-3 mr-1" />{cfg.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{studentName}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 md:mt-0 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-emerald-700 font-medium transition-colors shrink-0">
                            Review <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      variant="ghost"
                      className="w-full sm:hidden"
                      onClick={() => router.push('/teacher/dashboard/assigned-proposals')}
                    >
                      View All Proposals
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity from notifications */}
          <Card className="border-none shadow-sm ring-1 ring-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-4">
              {recentNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {recentNotifications.map((n, i) => (
                    <div key={n.id} className="flex items-start gap-3 relative">
                      {i !== recentNotifications.length - 1 && (
                        <div className="absolute left-[5px] top-5 bottom-[-1rem] w-px bg-gray-100" />
                      )}
                      <div className={`h-3 w-3 rounded-full mt-1 shrink-0 ${n.isRead ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                      <div>
                        <p className="text-sm capitalize font-medium">{n.notificationType}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{formatTime(n.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
