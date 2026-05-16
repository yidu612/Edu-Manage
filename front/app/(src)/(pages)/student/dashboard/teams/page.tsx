"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, Lock, Clock, Crown } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Team } from "@/types";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function TeamsListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: teams, isLoading } = useSWR<Team[]>('/teams', fetcher);

  const myTeams = teams?.filter(t => t.members.find(m => m.user_id === user?.id)?.invitation_status === 'accepted') || [];

  return (
    <DashboardLayout role="student">
      <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground">View your assigned project team.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">My Active Teams</h3>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : myTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl bg-muted/10">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No active teams</h3>
              <p className="text-muted-foreground">Your team will be assigned by the administrator.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myTeams.map((team) => {
                const myRole = team.members.find(m => m.user_id === user?.id)?.role;
                return (
                  <Card
                    key={team.id}
                    className="group hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary"
                    onClick={() => router.push(`/student/dashboard/teams/${team.id}`)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl line-clamp-1">{team.name}</CardTitle>
                        {team.is_finalized ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                            <Lock className="w-3 h-3 mr-1" /> Finalized
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="w-3 h-3 mr-1" /> Draft
                          </Badge>
                        )}
                      </div>
                      <CardDescription>Created by {team.creator?.name || "Unknown"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          {team.members.length} Members
                        </div>
                        {myRole === 'leader' && (
                          <Badge variant="secondary" className="gap-1 bg-amber-50 text-amber-700">
                            <Crown className="w-3 h-3 text-amber-500" /> Leader
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View Team <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
