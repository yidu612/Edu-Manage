"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Crown, Trash2, CheckCircle, Lock, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Team, User } from "@/types";
import toast from "react-hot-toast";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const teamId = params.id;

  const { data: team, isLoading, error } = useSWR<Team>(teamId ? `/teams/${teamId}` : null, fetcher);
  const { data: peers } = useSWR<User[]>('/users/peers', fetcher);

  const isLeader = team?.members.find(m => m.user_id === user?.id)?.role === 'leader';
  const isFinalized = team?.is_finalized;

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [selectedPeerId, setSelectedPeerId] = useState<string>("");
  const [memberToPromote, setMemberToPromote] = useState<{ id: number, name: string } | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number, name: string } | null>(null);

  // --- Handlers ---

  const handleInvite = async () => {
    if (!selectedPeerId) return toast.error("Select a student");
    try {
      await api.post(`/teams/${teamId}/invite`, { user_id: parseInt(selectedPeerId) });
      toast.success("Invitation sent!");
      mutate(`/teams/${teamId}`);
      setShowInviteDialog(false);
      setSelectedPeerId("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invite failed");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await api.delete(`/teams/${teamId}/members/${memberToRemove.id}`);
      toast.success("Member removed");
      mutate(`/teams/${teamId}`);
      setMemberToRemove(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove");
    }
  };

  const handleTransferLeadership = async () => {
    if (!memberToPromote) return;
    try {
      await api.post(`/teams/${teamId}/transfer-leadership`, { new_leader_id: memberToPromote.id });
      toast.success(`Leadership transferred to ${memberToPromote.name}`);
      mutate(`/teams/${teamId}`);
      setMemberToPromote(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Transfer failed");
    }
  };

  const handleFinalize = async () => {
    try {
      // Correct endpoint based on your backend
      await api.post(`/teams/${teamId}/finalize`);
      toast.success("Team Finalized!");
      mutate(`/teams/${teamId}`);
      setShowFinalizeDialog(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Finalize failed (Check 404)");
    }
  };

  if (isLoading) return (
    <DashboardLayout role="student">
      <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  if (error || !team) return (
    <DashboardLayout role="student">
      <div className="p-8 text-center text-red-500">Team not found</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="student">
      <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/student/dashboard/teams")} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">{team.name}</h2>
              {isFinalized ? (
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

          <div className="flex gap-3 ml-12 md:ml-0">
            {isLeader && !isFinalized && (
              <>
                <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowFinalizeDialog(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Finalize Team
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {team.members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-muted/20 transition-colors">
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
                        <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-700">Leader</Badge>
                      )}
                      {member.user_id === user?.id && <Badge variant="outline" className="text-[10px] h-5">You</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={member.invitation_status === 'accepted' ? 'default' : 'secondary'} className={member.invitation_status === 'accepted' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                    {member.invitation_status}
                  </Badge>

                  {/* Leader Actions */}
                  {isLeader && !isFinalized && member.user_id !== user?.id && (
                    <div className="flex items-center gap-2 ml-4 border-l pl-4">
                      
                      {/* Only allow Transfer if Accepted */}
                      {member.invitation_status === 'accepted' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 gap-1 h-8"
                          onClick={() => setMemberToPromote({ id: member.user_id, name: member.user.name })}
                        >
                          <Crown className="h-3 w-3" />
                          <span className="text-xs">Make Leader</span>
                        </Button>
                      )}

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 gap-1 h-8"
                        onClick={() => setMemberToRemove({ id: member.user_id, name: member.user.name })}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="text-xs">Remove</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* --- Dialogs (Modals) --- */}

      {/* Smart Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Student</DialogTitle>
              <DialogDescription>Search for students in your department.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Search Logic inside Select is tricky, using a filter instead */}
              <Select onValueChange={setSelectedPeerId} value={selectedPeerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {peers?.map((p) => {
                    // Check if already in team
                    const isMember = team?.members.some(m => m.user_id === p.id);
                    return (
                      <SelectItem 
                        key={p.id} 
                        value={p.id.toString()}
                        disabled={isMember} // 👈 Disable if already in team
                        className={isMember ? "opacity-50 cursor-not-allowed bg-muted/50" : ""}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{p.name} {isMember && "(Already added)"}</span>
                          <span className="text-xs text-muted-foreground">{p.email}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                  {peers?.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">No peers found</div>}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only students from your department ({team?.department?.name || "Same Dept"}) are shown.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleInvite} disabled={!selectedPeerId}>Send Invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Leadership Modal */}
        <Dialog open={!!memberToPromote} onOpenChange={(o) => !o && setMemberToPromote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <Crown className="h-5 w-5" /> Transfer Leadership
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to make <strong>{memberToPromote?.name}</strong> the team leader? 
                You will become a regular member.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMemberToPromote(null)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleTransferLeadership}>Confirm Transfer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Member Modal */}
        <Dialog open={!!memberToRemove} onOpenChange={(o) => !o && setMemberToRemove(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" /> Remove Member
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from the team?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMemberToRemove(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRemoveMember}>Remove</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Finalize Modal */}
        <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-5 w-5" /> Finalize Team?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. Once finalized:
                <ul className="list-disc ml-5 mt-2 space-y-1 text-muted-foreground">
                  <li>You cannot add or remove members.</li>
                  <li>You cannot change the leader.</li>
                  <li>You will be able to submit proposals.</li>
                </ul>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleFinalize}>Confirm & Lock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}