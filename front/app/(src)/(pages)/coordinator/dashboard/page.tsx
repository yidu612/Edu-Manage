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
  FileText, ArrowRight, Clock, CheckCircle2, Users, Bell, Loader2, Building2,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  title: string;
  status: string;
  studentId?: { name?: string; fullName?: string; department?: string };
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
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: projData, isLoading } = useSWR('/coordinator/projects', fetcher);
  const { data: teamData }            = useSWR('/coordinator/teams', fetcher);
  const { data: notifData }           = useSWR('/notifications', fetcher);

  const projects: Project[]      = projData?.data ?? [];
  const teamCount: number        = teamData?.data?.length ?? 0;
  const notifications: Notification[] = notifData?.data ?? [];

  const stats = useMemo(() => ({
    total:    projects.length,
    pending:  projects.filter((p) => p.status === 'submitted' || p.status === 'under_review').length,
    approved: projects.filter((p) => p.status === 'approved').length,
    teams:    teamCount,
  }), [projects, teamCount]);

  const recentProjects       = projects.slice(0, 5);
  const recentNotifications  = notifications.slice(0, 5);

  const statusColor: Record<string, string> = {
    approved:     'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected:     'bg-red-100 text-red-700 border-red-200',
    submitted:    'bg-amber-100 text-amber-700 border-amber-200',
    under_review: 'bg-blue-100 text-blue-700 border-blue-200',
    draft:        'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coordinator Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Welcome, {user?.name ?? 'Coordinator'}. Overseeing{' '}
            <span className="font-medium text-foreground">{user?.department ?? 'your department'}</span>.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Dept. Projects"  value={stats.total}    icon={FileText} />
          <StatsCard title="Pending Review"  value={stats.pending}  icon={Clock} />
          <StatsCard title="Approved"        value={stats.approved} icon={CheckCircle2} />
          <StatsCard title="Dept. Teams"     value={stats.teams}    icon={Users} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent projects */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <CardTitle className="text-xl font-bold">Department Projects</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">All projects in your department</p>
                </div>
                <Button
                  variant="outline" size="sm"
                  className="hidden sm:flex text-xs h-8 rounded-full"
                  onClick={() => router.push('/coordinator/dashboard/projects')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No projects in your department yet.</p>
                  </div>
                ) : (
                  recentProjects.map((item) => {
                    const studentName = item.studentId?.name ?? item.studentId?.fullName ?? '—';
                    return (
                      <div
                        key={item.id}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer"
                        onClick={() => router.push('/coordinator/dashboard/projects')}
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                            <FileText className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm">{item.title}</h3>
                              <Badge variant="outline" className={`rounded-full text-xs ${statusColor[item.status] ?? statusColor.draft}`}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{studentName}</p>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-orange-700 font-medium transition-colors shrink-0">
                          View <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent notifications */}
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
