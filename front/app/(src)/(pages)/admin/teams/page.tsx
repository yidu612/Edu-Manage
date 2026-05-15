'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  AlertCircle,
  Calendar,
  GraduationCap,
  FileText,
  Building2,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================
interface Team {
  id: string;
  name: string;
  leader: string;
  members: string[];
  proposalTitle: string;
  proposalStatus: 'submitted' | 'under_review' | 'approved' | 'rejected';
  advisorName: string | null;
  createdAt: string;
}

// ============================================================================
// Mock Data
// ============================================================================
const mockTeams: Team[] = [
  {
    id: 't1',
    name: 'Team Alpha',
    leader: 'John Doe',
    members: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Emily Brown'],
    proposalTitle: 'AI-Powered Student Performance Analytics',
    proposalStatus: 'submitted',
    advisorName: null,
    createdAt: '2026-01-10',
  },
  {
    id: 't2',
    name: 'Team Beta',
    leader: 'Alice Brown',
    members: ['Alice Brown', 'Bob Wilson', 'Carol Lee'],
    proposalTitle: 'Blockchain Certificate Verification',
    proposalStatus: 'submitted',
    advisorName: null,
    createdAt: '2026-01-12',
  },
  {
    id: 't3',
    name: 'Team Gamma',
    leader: 'David Park',
    members: ['David Park', 'Sarah Kim', 'Tom Chen', 'Lisa Wang', 'James Lee'],
    proposalTitle: 'Smart Campus Navigation App',
    proposalStatus: 'under_review',
    advisorName: 'Dr. Sarah Johnson',
    createdAt: '2026-01-08',
  },
  {
    id: 't4',
    name: 'Team Delta',
    leader: 'Emma Wilson',
    members: ['Emma Wilson', 'Ryan Garcia', 'Sophia Martinez'],
    proposalTitle: 'Library Management System',
    proposalStatus: 'approved',
    advisorName: 'Prof. Michael Chen',
    createdAt: '2026-01-05',
  },
  {
    id: 't5',
    name: 'Team Epsilon',
    leader: 'Kevin Nguyen',
    members: ['Kevin Nguyen', 'Amy Zhang'],
    proposalTitle: 'Online Exam Proctoring System',
    proposalStatus: 'under_review',
    advisorName: 'Dr. Emily Davis',
    createdAt: '2026-01-15',
  },
];

// ============================================================================
// Helpers
// ============================================================================
const getStatusBadge = (status: Team['proposalStatus']) => {
  const config = {
    submitted: {
      label: 'Pending Assignment',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Clock,
    },
    under_review: {
      label: 'Under Review',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Eye,
    },
    approved: {
      label: 'Approved',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: AlertCircle,
    },
  };
  const { label, color, icon: Icon } = config[status];
  return (
    <Badge variant="outline" className={`gap-1 ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

// ============================================================================
// Component
// ============================================================================
export default function TeamsOverviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const stats = useMemo(
    () => ({
      total: mockTeams.length,
      pending: mockTeams.filter((t) => t.proposalStatus === 'submitted').length,
      underReview: mockTeams.filter((t) => t.proposalStatus === 'under_review')
        .length,
      approved: mockTeams.filter((t) => t.proposalStatus === 'approved').length,
    }),
    [],
  );

  const filteredTeams = useMemo(() => {
    return mockTeams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.proposalTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || team.proposalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleViewDetails = (team: Team) => {
    setSelectedTeam(team);
    setShowDetailsDialog(true);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Teams Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              View all student teams in your department
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <Building2 className="h-4 w-4" />
            Computer Science Department
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Teams
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {stats.total}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending Assignment
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">
                {stats.pending}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" /> Under Review
              </CardDescription>
              <CardTitle className="text-3xl text-blue-900">
                {stats.underReview}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Approved
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">
                {stats.approved}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Student Teams</CardTitle>
                <CardDescription>
                  All registered teams in your department
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams..."
                    className="pl-10 rounded-full w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] rounded-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="submitted">
                      Pending Assignment
                    </SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTeams.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No Teams Found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTeams.map((team) => (
                  <Card
                    key={team.id}
                    className="hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                    onClick={() => handleViewDetails(team)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Led by {team.leader}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(team.proposalStatus)}
                      </div>

                      <div className="mt-4 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium truncate">
                            {team.proposalTitle}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {team.members.length} members
                        </div>
                        {team.advisorName ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                {getInitials(team.advisorName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{team.advisorName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600">
                            No advisor assigned
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this team
            </DialogDescription>
          </DialogHeader>

          {selectedTeam && (
            <div className="space-y-6 py-4">
              {/* Team Name and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedTeam.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created on {selectedTeam.createdAt}
                    </p>
                  </div>
                </div>
                {getStatusBadge(selectedTeam.proposalStatus)}
              </div>

              {/* Proposal */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Proposal
                </h4>
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {selectedTeam.proposalTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Team Members ({selectedTeam.members.length})
                </h4>
                <div className="space-y-2">
                  {selectedTeam.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member}</p>
                        {member === selectedTeam.leader && (
                          <Badge variant="secondary" className="text-xs">
                            Team Leader
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisor */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Assigned Advisor
                </h4>
                {selectedTeam.advisorName ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {getInitials(selectedTeam.advisorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTeam.advisorName}</p>
                      <p className="text-sm text-muted-foreground">
                        Faculty Advisor
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed text-center">
                    <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No advisor assigned yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
