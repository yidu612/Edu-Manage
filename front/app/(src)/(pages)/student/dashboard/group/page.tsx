'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
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
  Clock,
  BookOpen,
  Send,
  UserX,
  Plus,
  Settings,
  LogOut,
  MessageSquare,
  Copy,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api, { teamApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Mock Data - Current user is the leader
const currentUser = {
  id: 'u1',
  name: 'John Doe',
  email: 'john.doe@university.edu',
};

// Mock team data
const myTeam = {
  id: 't1',
  name: 'Team Alpha',
  description: 'Building an AI-powered project management system',
  code: 'ALPHA-2024',
  createdAt: '2024-01-10',
  status: 'pending_approval', // pending_approval, approved, rejected
  members: [
    {
      id: 'u1',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      role: 'leader',
      status: 'active',
    },
    {
      id: 'u2',
      name: 'Alice Brown',
      email: 'alice.brown@university.edu',
      role: 'member',
      status: 'active',
    },
    {
      id: 'u3',
      name: 'Bob Wilson',
      email: 'bob.wilson@university.edu',
      role: 'member',
      status: 'pending',
    },
  ],
  advisor: null,
  advisorRequest: {
    teacher: {
      id: 't1',
      name: 'Dr. Sarah Johnson',
      department: 'Computer Science',
    },
    status: 'pending', // pending, accepted, rejected
    requestedAt: '2024-01-12',
  },
};

// Mock available teachers for advisor selection
const availableTeachers = [
  {
    id: 't1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Computer Science',
    specialization: 'AI/ML',
    slots: 3,
  },
  {
    id: 't2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    department: 'Computer Science',
    specialization: 'Software Architecture',
    slots: 1,
  },
  {
    id: 't3',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@university.edu',
    department: 'Software Engineering',
    specialization: 'Web Technologies',
    slots: 5,
  },
  {
    id: 't4',
    name: 'Prof. David Park',
    email: 'david.park@university.edu',
    department: 'Information Technology',
    specialization: 'Cloud Computing',
    slots: 0,
  },
];

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function GroupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [hasTeam, setHasTeam] = useState(true);
  const [team, setTeam] = useState(myTeam);

  const { data: peers } = useSWR<any[]>('/users/peers', fetcher);

  // Dialog states
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAdvisorDialog, setShowAdvisorDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const isLeader =
    team.members.find((m) => m.id === currentUser.id)?.role === 'leader';

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;

    // Simulate team creation - creator becomes leader automatically
    toast({
      title: 'Team Created!',
      description: `${newTeamName} has been created. You are now the team leader.`,
    });
    setShowCreateTeamDialog(false);
    setHasTeam(true);
    setNewTeamName('');
    setNewTeamDescription('');
  };

  const handleInviteMember = async () => {
    if (!selectedStudent && !inviteEmail) return;
    try {
      if (selectedStudent) {
        await api.post(`/teams/${team.id}/invite`, { user_id: parseInt(selectedStudent) });
      } else {
        await teamApi.inviteByEmail(team.id, inviteEmail);
      }
      toast({ title: 'Invitation Sent', description: 'The student has been notified.' });
      setShowInviteDialog(false);
      setSelectedStudent('');
      setInviteEmail('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Invite failed.' });
    }
  };

  const handleRequestAdvisor = () => {
    const teacher = availableTeachers.find((t) => t.id === selectedAdvisor);
    if (!teacher) return;

    toast({
      title: 'Advisor Request Sent',
      description: `Your request has been sent to ${teacher.name}. Please wait for their response.`,
    });
    setShowAdvisorDialog(false);
    setSelectedAdvisor('');
  };

  const handleRemoveMember = (memberId: string) => {
    const member = team.members.find((m) => m.id === memberId);
    toast({
      title: 'Member Removed',
      description: `${member?.name} has been removed from the team.`,
    });
  };

  const handleLeaveTeam = async () => {
    try {
      await teamApi.leaveTeam(team.id);
      toast({ title: 'Left Team', description: 'You have left the team successfully.' });
      setShowLeaveDialog(false);
      setHasTeam(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to leave team.' });
    }
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(team.code);
    toast({ title: 'Copied!', description: 'Team code copied to clipboard.' });
  };

  // No Team State
  if (!hasTeam) {
    return (
      <DashboardLayout role="student">
        <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
          <Card className="max-w-lg w-full border-dashed">
            <CardContent className="py-16 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                You&apos;re Not in a Team Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create a new team to start your project journey, or join an
                existing team using an invite code.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="rounded-full gap-2"
                  onClick={() => setShowCreateTeamDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
                <Button variant="outline" className="rounded-full gap-2">
                  <UserPlus className="h-4 w-4" />
                  Join with Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Team Dialog */}
        <Dialog
          open={showCreateTeamDialog}
          onOpenChange={setShowCreateTeamDialog}
        >
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Create New Team
              </DialogTitle>
              <DialogDescription>
                Create a team for your project. You will automatically become
                the team leader.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
                  <Crown className="h-4 w-4" />
                  You&apos;ll be the Team Leader
                </div>
                <p className="text-sm text-amber-700">
                  As the team creator, you will be assigned as the leader with
                  permissions to manage members and settings.
                </p>
              </div>

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
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setShowCreateTeamDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-full"
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
              >
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    );
  }

  // Has Team State
  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
              {team.status === 'pending_approval' && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-700 border-amber-200"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Approval
                </Badge>
              )}
              {team.status === 'approved' && (
                <Badge
                  variant="outline"
                  className="bg-emerald-100 text-emerald-700 border-emerald-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{team.description}</p>
          </div>
          {isLeader && (
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          )}
        </div>

        {/* Team Code Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Team Invite Code
                </p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {team.code}
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full gap-2"
                onClick={copyTeamCode}
              >
                <Copy className="h-4 w-4" />
                Copy Code
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
                      <Users className="h-5 w-5 text-primary" />
                      Team Members
                    </CardTitle>
                    <CardDescription>
                      {team.members.length} members
                    </CardDescription>
                  </div>
                  {isLeader && (
                    <Button
                      className="rounded-full gap-2"
                      onClick={() => setShowInviteDialog(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-background shadow">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{member.name}</h4>
                          {member.role === 'leader' && (
                            <Badge className="bg-amber-100 text-amber-700 gap-1">
                              <Crown className="h-3 w-3" />
                              Leader
                            </Badge>
                          )}
                          {member.status === 'pending' && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    {isLeader && member.id !== currentUser.id && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Status Card */}
            {team.status === 'pending_approval' && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900">
                        Awaiting Teacher Approval
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Your team is pending approval from a teacher. Once
                        approved, you can start working on your project
                        proposal.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Advisor Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Advisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {team.advisor ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar>
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {team.advisor}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{team.advisor}</p>
                        <p className="text-sm text-muted-foreground">
                          Your Advisor
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Accepted
                    </Badge>
                  </div>
                ) : team.advisorRequest ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarFallback className="bg-amber-100 text-amber-700">
                            {team.advisorRequest.teacher.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {team.advisorRequest.teacher.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {team.advisorRequest.teacher.department}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 gap-1">
                        <Clock className="h-3 w-3" />
                        Request Pending
                      </Badge>
                      <p className="text-xs text-amber-700 mt-2">
                        Requested on{' '}
                        {new Date(
                          team.advisorRequest.requestedAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      No advisor assigned yet
                    </p>
                    {isLeader && (
                      <Button
                        className="rounded-full gap-2 w-full"
                        onClick={() => setShowAdvisorDialog(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Request Advisor
                      </Button>
                    )}
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
                  <MessageSquare className="h-4 w-4" />
                  Team Discussions
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl gap-2 text-red-600 hover:bg-red-50"
                  onClick={() => setShowLeaveDialog(true)}
                >
                  <LogOut className="h-4 w-4" />
                  Leave Team
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
              <UserPlus className="h-5 w-5 text-primary" />
              Invite Member
            </DialogTitle>
            <DialogDescription>
              Invite a student to join your team.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="select" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="select" className="flex-1">
                Select Student
              </TabsTrigger>
              <TabsTrigger value="email" className="flex-1">
                By Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="mt-4 space-y-4">
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {peers?.map((p: any) => {
                    const isMember = team.members.some((m) => m.id === String(p.id));
                    return (
                      <SelectItem
                        key={p.id}
                        value={p.id.toString()}
                        disabled={isMember}
                        className={isMember ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <div>
                          <p>{p.name}{isMember ? ' (Already added)' : ''}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
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
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowInviteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full gap-2"
              onClick={handleInviteMember}
              disabled={!selectedStudent && !inviteEmail}
            >
              <Send className="h-4 w-4" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Advisor Dialog */}
      <Dialog open={showAdvisorDialog} onOpenChange={setShowAdvisorDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Request Advisor
            </DialogTitle>
            <DialogDescription>
              Select a teacher to be your project advisor. They will receive
              your request and can accept or decline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {availableTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAdvisor === teacher.id
                      ? 'border-primary bg-primary/5'
                      : teacher.slots === 0
                        ? 'border-muted bg-muted/30 opacity-50 cursor-not-allowed'
                        : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() =>
                    teacher.slots > 0 && setSelectedAdvisor(teacher.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {teacher.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {teacher.department}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {teacher.specialization}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={teacher.slots > 0 ? 'outline' : 'secondary'}
                      >
                        {teacher.slots > 0 ? `${teacher.slots} slots` : 'Full'}
                      </Badge>
                      {selectedAdvisor === teacher.id && (
                        <CheckCircle className="h-5 w-5 text-primary mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowAdvisorDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full gap-2"
              onClick={handleRequestAdvisor}
              disabled={!selectedAdvisor}
            >
              <Send className="h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Team Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <LogOut className="h-5 w-5" />
              Leave Team
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to leave {team.name}?
              {isLeader &&
                ' As the leader, the team will be transferred to another member or disbanded.'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowLeaveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={handleLeaveTeam}
            >
              Leave Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
