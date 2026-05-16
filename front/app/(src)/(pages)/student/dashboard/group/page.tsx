'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Crown,
  CheckCircle,
  Send,
  UserX,
  Plus,
  LogOut,
  MessageSquare,
  Copy,
  Loader2,
  KeyRound,
  GraduationCap,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

function getInitials(name: string = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function GroupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const { data: team, isLoading } = useSWR('/teams/my', fetcher);
  const { data: peers } = useSWR<any[]>('/users/peers', fetcher);
  const { data: projectData } = useSWR('/projects', (url) =>
    api.get(url).then((r) => (r.data.data ?? [])[0])
  );
  const mentor = projectData?.mentorId;

  // Dialog states
  const [showCreateDialog, setShowCreateDialog]   = useState(false);
  const [showJoinDialog, setShowJoinDialog]       = useState(false);
  const [showInviteDialog, setShowInviteDialog]   = useState(false);
  const [showLeaveDialog, setShowLeaveDialog]     = useState(false);

  // Form states
  const [newTeamName, setNewTeamName]           = useState('');
  const [newTeamDesc, setNewTeamDesc]           = useState('');
  const [joinCode, setJoinCode]                 = useState('');
  const [selectedStudent, setSelectedStudent]   = useState('');
  const [inviteEmail, setInviteEmail]           = useState('');
  const [isSaving, setIsSaving]                 = useState(false);

  const isLeader = team?.members?.find(
    (m: any) => m.user_id === user?.id && m.role === 'leader'
  );

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsSaving(true);
    try {
      await api.post('/teams', { name: newTeamName.trim(), description: newTeamDesc.trim() });
      mutate('/teams/my');
      setShowCreateDialog(false);
      setNewTeamName('');
      setNewTeamDesc('');
      toast({ title: 'Team Created!', description: 'You are now the team leader.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message ?? 'Failed to create team.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return;
    setIsSaving(true);
    try {
      await api.post('/teams/join', { code: joinCode.trim() });
      mutate('/teams/my');
      setShowJoinDialog(false);
      setJoinCode('');
      toast({ title: 'Joined Team!', description: 'You have successfully joined the team.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message ?? 'Invalid invite code.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteMember = async () => {
    if (!selectedStudent && !inviteEmail) return;
    setIsSaving(true);
    try {
      if (selectedStudent) {
        await api.post(`/teams/${team.id}/invite`, { user_id: selectedStudent });
      } else {
        await api.post(`/teams/${team.id}/invite`, { email: inviteEmail });
      }
      mutate('/teams/my');
      setShowInviteDialog(false);
      setSelectedStudent('');
      setInviteEmail('');
      toast({ title: 'Invitation Sent', description: 'The student has been notified.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message ?? 'Invite failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    try {
      await api.delete(`/teams/${team.id}/members/${userId}`);
      mutate('/teams/my');
      toast({ title: 'Member Removed', description: `${name} has been removed from the team.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message ?? 'Failed to remove member.' });
    }
  };

  const handleLeaveTeam = async () => {
    setIsSaving(true);
    try {
      await api.post(`/teams/${team.id}/leave`);
      mutate('/teams/my');
      setShowLeaveDialog(false);
      toast({ title: 'Left Team', description: 'You have left the team successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message ?? 'Failed to leave team.' });
    } finally {
      setIsSaving(false);
    }
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(team.code);
    toast({ title: 'Copied!', description: 'Team code copied to clipboard.' });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // ── No Team State ─────────────────────────────────────────────────────────
  if (!team) {
    return (
      <DashboardLayout role="student">
        <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
          <Card className="max-w-lg w-full border-dashed">
            <CardContent className="py-16 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You&apos;re Not in a Team Yet</h2>
              <p className="text-muted-foreground mb-6">
                Create a new team to start your project journey, or join an existing team using an invite code.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="rounded-full gap-2" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4" /> Create Team
                </Button>
                <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowJoinDialog(true)}>
                  <KeyRound className="h-4 w-4" /> Join with Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Team Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Create New Team
              </DialogTitle>
              <DialogDescription>
                You will automatically become the team leader.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-medium">Team Name *</Label>
                <Input
                  placeholder="e.g., Project Innovators"
                  className="rounded-xl"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Description</Label>
                <Textarea
                  placeholder="Brief description of your team's project focus..."
                  className="rounded-xl resize-none"
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button className="rounded-full gap-2" onClick={handleCreateTeam} disabled={!newTeamName.trim() || isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Join Team Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> Join a Team
              </DialogTitle>
              <DialogDescription>
                Enter the 6-character invite code shared by your team leader.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label className="font-medium">Invite Code</Label>
              <Input
                placeholder="XXXXXX"
                className="rounded-xl font-mono uppercase tracking-widest text-center text-lg"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => setShowJoinDialog(false)}>
                Cancel
              </Button>
              <Button className="rounded-full gap-2" onClick={handleJoinTeam} disabled={joinCode.length < 4 || isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Join Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    );
  }

  // ── Has Team State ────────────────────────────────────────────────────────
  const members: any[] = team.members ?? [];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
            {team.description && <p className="text-muted-foreground">{team.description}</p>}
          </div>
        </div>

        {/* Team Code Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team Invite Code</p>
                <p className="text-2xl font-mono font-bold text-primary">{team.code}</p>
              </div>
              <Button variant="outline" className="rounded-full gap-2" onClick={copyTeamCode}>
                <Copy className="h-4 w-4" /> Copy Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Members Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" /> Team Members
                    </CardTitle>
                    <CardDescription>{members.length} members</CardDescription>
                  </div>
                  {isLeader && (
                    <Button className="rounded-full gap-2" onClick={() => setShowInviteDialog(true)}>
                      <UserPlus className="h-4 w-4" /> Invite
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.map((member: any) => {
                  const name = member.user?.name ?? member.user?.fullName ?? 'Unknown';
                  const isMe = member.user_id === user?.id;
                  return (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{name}</h4>
                            {member.role === 'leader' && (
                              <Badge className="bg-amber-100 text-amber-700 gap-1">
                                <Crown className="h-3 w-3" /> Leader
                              </Badge>
                            )}
                            {isMe && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                            {member.invitation_status === 'pending' && (
                              <Badge variant="secondary" className="text-xs">Pending</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                      {isLeader && !isMe && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveMember(member.user_id, name)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Advisor (from project) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Advisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mentor ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {getInitials(mentor.name ?? mentor.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{mentor.name ?? mentor.fullName}</p>
                        <p className="text-sm text-muted-foreground">{mentor.department}</p>
                      </div>
                    </div>
                    <Badge className="mt-3 bg-emerald-100 text-emerald-700 gap-1">
                      <CheckCircle className="h-3 w-3" /> Assigned
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No advisor assigned yet. The admin will assign a mentor to your project.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl gap-2"
                  onClick={() => router.push('/student/dashboard/discussions')}
                >
                  <MessageSquare className="h-4 w-4" /> Team Discussions
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl gap-2 text-red-600 hover:bg-red-50"
                  onClick={() => setShowLeaveDialog(true)}
                >
                  <LogOut className="h-4 w-4" /> Leave Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Invite Member
            </DialogTitle>
            <DialogDescription>Invite a student to join your team.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="select" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="select" className="flex-1">Select Student</TabsTrigger>
              <TabsTrigger value="email" className="flex-1">By Email</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="mt-4 space-y-4">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {peers?.map((p: any) => {
                    const alreadyMember = members.some((m: any) => m.user_id === String(p.id));
                    return (
                      <SelectItem
                        key={p.id}
                        value={String(p.id)}
                        disabled={alreadyMember}
                        className={alreadyMember ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <span>{p.name ?? p.fullName}{alreadyMember ? ' (Already added)' : ''}</span>
                      </SelectItem>
                    );
                  })}
                  {!peers?.length && (
                    <div className="p-2 text-sm text-muted-foreground text-center">No peers found</div>
                  )}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="email" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="student@university.edu"
                  className="rounded-xl"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="rounded-full" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-full gap-2"
              onClick={handleInviteMember}
              disabled={(!selectedStudent && !inviteEmail) || isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Team Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <LogOut className="h-5 w-5" /> Leave Team
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to leave {team.name}?
              {isLeader && ' As the leader, the remaining members will need to elect a new leader.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="rounded-full" onClick={() => setShowLeaveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={handleLeaveTeam} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Leave Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
