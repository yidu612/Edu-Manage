"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Crown, Lock, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Team } from "@/types";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const teamId = params.id;

  const { data: team, isLoading, error } = useSWR<Team>(teamId ? `/teams/${teamId}` : null, fetcher);

  if (isLoading) return (
    <DashboardLayout role="student">
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  if (error || !team) return (
    <DashboardLayout role="student">
      <div className="p-8 text-center text-muted-foreground">Team not found or unavailable.</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="student">
      <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/student/dashboard/teams")} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">{team.name}</h2>
              {team.is_finalized ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 h-6">
                  <Lock className="w-3 h-3 mr-1" /> Finalized
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 h-6">
                  Draft Mode
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground ml-12">Managed by {team.creator?.name || "Unknown"}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {team.members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-4 rounded-xl border bg-card/50">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {member.user.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{member.user.name}</p>
                      {member.role === 'leader' && (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-700 gap-1">
                          <Crown className="h-3 w-3" />Leader
                        </Badge>
                      )}
                      {member.user_id === user?.id && (
                        <Badge variant="outline" className="text-[10px] h-5">You</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <Badge
                  variant={member.invitation_status === 'accepted' ? 'default' : 'secondary'}
                  className={member.invitation_status === 'accepted' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                >
                  {member.invitation_status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
