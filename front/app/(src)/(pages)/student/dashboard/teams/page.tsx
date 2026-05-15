"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Users, ArrowRight, Lock, Clock, Crown, Mail, Check, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Team } from "@/types";
import toast from "react-hot-toast";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function TeamsListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: teams, isLoading } = useSWR<Team[]>('/teams', fetcher);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [processingInvite, setProcessingInvite] = useState<number | null>(null);

  // Filter Teams
  const pendingTeams = teams?.filter(t => t.members.find(m => m.user_id === user?.id)?.invitation_status === 'pending') || [];
  const myTeams = teams?.filter(t => t.members.find(m => m.user_id === user?.id)?.invitation_status === 'accepted') || [];

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const res = await api.post('/teams', { name: newTeamName });
      toast.success("Team created successfully!");
      mutate('/teams');
      setShowCreateDialog(false);
      setNewTeamName("");
      router.push(`/student/dashboard/teams/${res.data.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleRespond = async (teamId: number, accept: boolean) => {
    setProcessingInvite(teamId);
    try {
      await api.post(`/teams/${teamId}/invitation/respond`, { accept });
      toast.success(accept ? "Invitation Accepted!" : "Invitation Rejected");
      mutate('/teams');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessingInvite(null);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
            <p className="text-muted-foreground">Manage your teams and invitations.</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="rounded-full shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </div>

       {/* --- Pending Invitations Section (Cleaner List) --- */}
        {pendingTeams.length > 0 && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/30 animate-in fade-in slide-in-from-top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Pending Invitations</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">{pendingTeams.length}</Badge>
              </div>
              <CardDescription>You have been invited to join these project teams.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {pendingTeams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-background border shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-base">{team.name}</span>
                    <span className="text-xs text-muted-foreground">Invited by {team.creator?.name || "Team Leader"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-3"
                      onClick={() => handleRespond(team.id, false)}
                      disabled={processingInvite === team.id}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4" 
                      onClick={() => handleRespond(team.id, true)}
                      disabled={processingInvite === team.id}
                    >
                      {processingInvite === team.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Accept"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* --- My Teams Section --- */}
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
              <p className="text-muted-foreground mb-4">Create a team or wait for an invitation.</p>
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
                      <CardDescription>
                        Created by {team.creator?.name || "Unknown"}
                      </CardDescription>
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
                        Manage Team <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Give your team a unique name to get started.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input placeholder="e.g. Alpha Squad" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}