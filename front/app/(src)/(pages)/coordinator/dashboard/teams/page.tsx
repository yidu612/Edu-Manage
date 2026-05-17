'use client';

import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Building2, Loader2, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type TeamMember = {
  user?: { name?: string; fullName?: string; department?: string };
  role: 'leader' | 'member';
  invitation_status: 'pending' | 'accepted' | 'rejected';
};

type Team = {
  id: string;
  name: string;
  description?: string;
  status: string;
  is_finalized: boolean;
  creator?: { name?: string; fullName?: string; department?: string };
  members: TeamMember[];
  createdAt: string;
};

const statusColor: Record<string, string> = {
  active:   'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

function initials(name?: string) {
  return (name ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function CoordinatorTeamsPage() {
  const { data, isLoading } = useSWR('/coordinator/teams', fetcher);
  const teams: Team[] = data?.data ?? [];

  const accepted = (t: Team) => t.members.filter((m) => m.invitation_status === 'accepted').length;

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Department Teams</h1>
          <p className="text-muted-foreground">Student teams active in your department</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : teams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-semibold text-lg">No teams in your department yet.</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => {
              const creatorName = team.creator?.name ?? team.creator?.fullName ?? '—';
              const memberCount = accepted(team);
              return (
                <Card key={team.id} className="hover:shadow-md transition-all hover:border-orange-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`border-0 text-xs ${statusColor[team.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {team.status}
                          </Badge>
                          {team.is_finalized && (
                            <Badge variant="outline" className="gap-1 text-xs border-emerald-200 text-emerald-700">
                              <ShieldCheck className="h-3 w-3" /> Finalized
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base font-bold">{team.name}</CardTitle>
                        {team.description && (
                          <CardDescription className="line-clamp-2">{team.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {memberCount} accepted member{memberCount !== 1 ? 's' : ''}
                      </span>
                      <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex -space-x-2">
                      {team.members
                        .filter((m) => m.invitation_status === 'accepted')
                        .slice(0, 5)
                        .map((m, i) => {
                          const name = m.user?.name ?? m.user?.fullName ?? '?';
                          return (
                            <Avatar key={i} className="h-7 w-7 border-2 border-background ring-0">
                              <AvatarFallback className="text-[10px] bg-orange-100 text-orange-700">
                                {initials(name)}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                      {memberCount > 5 && (
                        <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                          +{memberCount - 5}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Created by <span className="font-medium text-foreground">{creatorName}</span>
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
