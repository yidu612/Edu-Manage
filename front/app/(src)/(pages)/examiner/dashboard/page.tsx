'use client';

import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { StatsCard } from '@/app/(src)/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, CheckCircle2, Clock, ArrowRight, Loader2, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type DefenseSession = {
  id: string;
  projectId?: { title?: string };
  scheduledAt: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scores: { examinerId: string }[];
  examiners: { id: string }[];
};

export default function ExaminerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading } = useSWR('/examiner/defense-sessions', fetcher);
  const sessions: DefenseSession[] = data?.data ?? [];

  const scheduled  = sessions.filter((s) => s.status === 'scheduled');
  const completed  = sessions.filter((s) => s.status === 'completed');
  const myScores   = sessions.filter((s) => s.scores.some((sc) => sc.examinerId === user?.id));
  const pending    = scheduled.filter((s) => !s.scores.some((sc) => sc.examinerId === user?.id));

  const upcoming = scheduled.slice(0, 3);

  return (
    <DashboardLayout role="examiner">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examiner Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Welcome, {user?.name ?? 'Examiner'}. Manage your assigned defense sessions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Assigned"   value={sessions.length} icon={FileText} />
          <StatsCard title="Pending Score"    value={pending.length}  icon={Clock} />
          <StatsCard title="Scores Submitted" value={myScores.length} icon={CheckCircle2} />
          <StatsCard title="Completed"        value={completed.length} icon={CalendarCheck} />
        </div>

        <Card className="border-none shadow-sm ring-1 ring-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <CardTitle className="text-xl font-bold">Upcoming Defense Sessions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Sessions awaiting your evaluation</p>
            </div>
            <Button
              variant="outline" size="sm"
              className="hidden sm:flex text-xs h-8 rounded-full"
              onClick={() => router.push('/examiner/dashboard/defense-sessions')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-rose-400" />
                <p className="font-semibold">No upcoming defense sessions.</p>
                <p className="text-sm mt-1">The administrator will assign sessions to you.</p>
              </div>
            ) : (
              upcoming.map((s) => {
                const hasScore = s.scores.some((sc) => sc.examinerId === user?.id);
                return (
                  <div
                    key={s.id}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border hover:border-rose-200 hover:bg-rose-50/30 transition-all cursor-pointer"
                    onClick={() => router.push('/examiner/dashboard/defense-sessions')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                        <CalendarCheck className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{s.projectId?.title ?? 'Untitled Project'}</h3>
                          <Badge variant="outline" className={hasScore
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'}>
                            {hasScore ? 'Score Submitted' : 'Awaiting Score'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.scheduledAt).toLocaleString()}
                          {s.location && ` · ${s.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-rose-700 font-medium transition-colors shrink-0">
                      {hasScore ? 'Update Score' : 'Submit Score'} <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
