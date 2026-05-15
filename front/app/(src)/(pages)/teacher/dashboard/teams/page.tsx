'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  UserCheck,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Building2,
  Mail,
  Calendar,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';

// Mock Data - Teams pending approval
const pendingTeams = [
  {
    id: 't1',
    name: 'Team Alpha',
    description: 'Building an AI-powered project management system',
    leader: { name: 'John Doe', email: 'john.doe@university.edu' },
    members: [
      { name: 'John Doe', email: 'john.doe@university.edu', role: 'leader' },
      {
        name: 'Alice Brown',
        email: 'alice.brown@university.edu',
        role: 'member',
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@university.edu',
        role: 'member',
      },
    ],
    department: 'Computer Science',
    requestedAt: '2024-01-14',
  },
  {
    id: 't2',
    name: 'Team Beta',
    description: 'E-commerce platform with blockchain integration',
    leader: { name: 'Carol Lee', email: 'carol.lee@university.edu' },
    members: [
      { name: 'Carol Lee', email: 'carol.lee@university.edu', role: 'leader' },
      { name: 'David Kim', email: 'david.kim@university.edu', role: 'member' },
    ],
    department: 'Computer Science',
    requestedAt: '2024-01-15',
  },
];

// Mock Data - Advisor requests
const advisorRequests = [
  {
    id: 'a1',
    team: {
      id: 't1',
      name: 'Team Alpha',
      description: 'Building an AI-powered project management system',
      leader: 'John Doe',
      memberCount: 3,
    },
    requestedAt: '2024-01-12',
    message:
      'We are working on an AI/ML project and would appreciate your expertise in guiding us through the machine learning implementation.',
  },
  {
    id: 'a2',
    team: {
      id: 't3',
      name: 'Team Gamma',
      description: 'Smart campus navigation system',
      leader: 'Emma Thompson',
      memberCount: 4,
    },
    requestedAt: '2024-01-13',
    message:
      'Our project involves mobile app development and we believe your experience in software architecture would be invaluable.',
  },
  {
    id: 'a3',
    team: {
      id: 't4',
      name: 'Team Delta',
      description: 'Healthcare management platform',
      leader: 'Mike Johnson',
      memberCount: 3,
    },
    requestedAt: '2024-01-14',
    message: null,
  },
];

// My advised teams
const myAdvisedTeams = [
  {
    id: 'at1',
    name: 'Team Omega',
    leader: 'Sarah Williams',
    memberCount: 4,
    projectTitle: 'Automated Attendance System',
    status: 'active',
    acceptedAt: '2024-01-05',
  },
  {
    id: 'at2',
    name: 'Team Sigma',
    leader: 'James Brown',
    memberCount: 3,
    projectTitle: 'Library Management System',
    status: 'active',
    acceptedAt: '2024-01-08',
  },
];

export default function TeamsPage() {
  const { toast } = useToast();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showAdvisorDialog, setShowAdvisorDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<
    (typeof pendingTeams)[0] | null
  >(null);
  const [selectedRequest, setSelectedRequest] = useState<
    (typeof advisorRequests)[0] | null
  >(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [feedback, setFeedback] = useState('');

  const handleTeamAction = (
    team: (typeof pendingTeams)[0],
    act: 'approve' | 'reject',
  ) => {
    setSelectedTeam(team);
    setAction(act);
    setFeedback('');
    setShowApprovalDialog(true);
  };

  const handleAdvisorAction = (
    request: (typeof advisorRequests)[0],
    act: 'approve' | 'reject',
  ) => {
    setSelectedRequest(request);
    setAction(act);
    setFeedback('');
    setShowAdvisorDialog(true);
  };

  const confirmTeamAction = () => {
    if (!selectedTeam) return;
    toast({
      title: action === 'approve' ? 'Team Approved' : 'Team Rejected',
      description: `${selectedTeam.name} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
    });
    setShowApprovalDialog(false);
  };

  const confirmAdvisorAction = () => {
    if (!selectedRequest) return;
    toast({
      title: action === 'approve' ? 'Request Accepted' : 'Request Declined',
      description:
        action === 'approve'
          ? `You are now the advisor for ${selectedRequest.team.name}.`
          : `You have declined the request from ${selectedRequest.team.name}.`,
    });
    setShowAdvisorDialog(false);
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Teams & Advisor Requests
          </h1>
          <p className="text-muted-foreground">
            Manage team approvals and advisor requests from students.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending Teams
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">
                {pendingTeams.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Advisor Requests
              </CardDescription>
              <CardTitle className="text-3xl text-blue-900">
                {advisorRequests.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> My Teams
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">
                {myAdvisedTeams.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Total Students
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {myAdvisedTeams.reduce((acc, t) => acc + t.memberCount, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Teams ({pendingTeams.length})
            </TabsTrigger>
            <TabsTrigger value="advisor">
              Advisor Requests ({advisorRequests.length})
            </TabsTrigger>
            <TabsTrigger value="myteams">
              My Teams ({myAdvisedTeams.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Teams Tab */}
          <TabsContent value="pending" className="mt-6 space-y-4">
            {pendingTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">
                    No Pending Approvals
                  </h3>
                  <p className="text-muted-foreground">
                    All team registrations have been processed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingTeams.map((team) => (
                <Card
                  key={team.id}
                  className="hover:shadow-md transition-all hover:border-primary/20"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {team.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                {team.department}
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  team.requestedAt,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {team.description}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">
                            Team Members ({team.members.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {team.members.map((member) => (
                              <div
                                key={member.email}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {member.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{member.name}</span>
                                {member.role === 'leader' && (
                                  <Crown className="h-3 w-3 text-amber-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 lg:flex-col">
                        <Button
                          className="flex-1 lg:flex-none rounded-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                          onClick={() => handleTeamAction(team, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 lg:flex-none rounded-full text-red-600 border-red-200 hover:bg-red-50 gap-2"
                          onClick={() => handleTeamAction(team, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Advisor Requests Tab */}
          <TabsContent value="advisor" className="mt-6 space-y-4">
            {advisorRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    You have no pending advisor requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              advisorRequests.map((request) => (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-all hover:border-primary/20"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                              <UserCheck className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {request.team.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Crown className="h-3 w-3" />
                                Led by {request.team.leader}
                                <span>•</span>
                                {request.team.memberCount} members
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {request.team.description}
                          </p>
                        </div>

                        {request.message && (
                          <div className="p-4 rounded-xl bg-muted/30 border border-muted">
                            <div className="flex items-center gap-2 text-sm font-medium mb-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              Message from the team
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                              &quot;{request.message}&quot;
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Requested on{' '}
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2 lg:flex-col">
                        <Button
                          className="flex-1 lg:flex-none rounded-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                          onClick={() =>
                            handleAdvisorAction(request, 'approve')
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 lg:flex-none rounded-full text-red-600 border-red-200 hover:bg-red-50 gap-2"
                          onClick={() => handleAdvisorAction(request, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* My Teams Tab */}
          <TabsContent value="myteams" className="mt-6 space-y-4">
            {myAdvisedTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">No Teams Yet</h3>
                  <p className="text-muted-foreground">
                    You haven&apos;t accepted any advisor requests yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              myAdvisedTeams.map((team) => (
                <Card
                  key={team.id}
                  className="hover:shadow-md transition-all hover:border-primary/20"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {team.projectTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Crown className="h-3 w-3" />
                            {team.leader}
                            <span>•</span>
                            {team.memberCount} members
                            <span>•</span>
                            Advising since{' '}
                            {new Date(team.acceptedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Team Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {action === 'approve' ? 'Approve Team' : 'Reject Team'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? `Approve ${selectedTeam?.name}? They will be able to start their project work.`
                : `Reject ${selectedTeam?.name}? Please provide a reason.`}
            </DialogDescription>
          </DialogHeader>

          {action === 'reject' && (
            <div className="space-y-2 py-4">
              <label className="text-sm font-medium">
                Reason for rejection
              </label>
              <Textarea
                placeholder="Please explain why this team is being rejected..."
                className="rounded-xl resize-none"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className={`rounded-full ${action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={confirmTeamAction}
            >
              {action === 'approve' ? 'Approve Team' : 'Reject Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advisor Request Dialog */}
      <Dialog open={showAdvisorDialog} onOpenChange={setShowAdvisorDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {action === 'approve' ? 'Accept Request' : 'Decline Request'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? `Accept to become the advisor for ${selectedRequest?.team.name}?`
                : `Decline the advisor request from ${selectedRequest?.team.name}?`}
            </DialogDescription>
          </DialogHeader>

          {action === 'reject' && (
            <div className="space-y-2 py-4">
              <label className="text-sm font-medium">
                Message to team (optional)
              </label>
              <Textarea
                placeholder="Let them know why you're declining..."
                className="rounded-xl resize-none"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowAdvisorDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className={`rounded-full ${action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={confirmAdvisorAction}
            >
              {action === 'approve' ? 'Accept' : 'Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
