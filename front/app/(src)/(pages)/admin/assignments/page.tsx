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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  BookOpen,
  GraduationCap,
  Link2,
  Building2,
  FileText,
  AlertCircle,
  Calendar,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';

// ============================================================================
// Types
// ============================================================================
interface Proposal {
  id: string;
  title: string;
  abstract: string;
  teamName: string;
  teamLeader: string;
  teamMembers: string[];
  department: string;
  status:
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'revision_needed';
  advisorId: string | null;
  advisorName: string | null;
  submittedAt: string;
  updatedAt: string;
}

interface Advisor {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  assignedProposals: number;
  maxCapacity: number;
  available: boolean;
}

// ============================================================================
// Mock Data - Replace with useSWR API calls in production
// ============================================================================

// GET /proposals?status=submitted&department_id={dept_id}
const mockProposals: Proposal[] = [
  {
    id: 'p1',
    title: 'AI-Powered Student Performance Analytics System',
    abstract:
      'An intelligent system that uses machine learning algorithms to predict student academic performance and provide early intervention recommendations.',
    teamName: 'Team Alpha',
    teamLeader: 'John Doe',
    teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Emily Brown'],
    department: 'Computer Science',
    status: 'submitted',
    advisorId: null,
    advisorName: null,
    submittedAt: '2026-01-20',
    updatedAt: '2026-01-20',
  },
  {
    id: 'p2',
    title: 'Blockchain-Based Academic Certificate Verification',
    abstract:
      'A secure and tamper-proof system for verifying academic credentials using blockchain technology.',
    teamName: 'Team Beta',
    teamLeader: 'Alice Brown',
    teamMembers: ['Alice Brown', 'Bob Wilson', 'Carol Lee'],
    department: 'Computer Science',
    status: 'submitted',
    advisorId: null,
    advisorName: null,
    submittedAt: '2026-01-19',
    updatedAt: '2026-01-19',
  },
  {
    id: 'p3',
    title: 'Smart Campus Navigation Mobile App',
    abstract:
      'A mobile application with AR features to help students and visitors navigate the university campus.',
    teamName: 'Team Gamma',
    teamLeader: 'David Park',
    teamMembers: [
      'David Park',
      'Sarah Kim',
      'Tom Chen',
      'Lisa Wang',
      'James Lee',
    ],
    department: 'Computer Science',
    status: 'under_review',
    advisorId: 't1',
    advisorName: 'Dr. Sarah Johnson',
    submittedAt: '2026-01-15',
    updatedAt: '2026-01-18',
  },
  {
    id: 'p4',
    title: 'University Library Management System',
    abstract:
      'A comprehensive digital system to manage library resources, borrowing, and inventory.',
    teamName: 'Team Delta',
    teamLeader: 'Emma Wilson',
    teamMembers: ['Emma Wilson', 'Ryan Garcia', 'Sophia Martinez'],
    department: 'Computer Science',
    status: 'approved',
    advisorId: 't2',
    advisorName: 'Prof. Michael Chen',
    submittedAt: '2026-01-10',
    updatedAt: '2026-01-17',
  },
  {
    id: 'p5',
    title: 'Online Exam Proctoring System',
    abstract:
      'An AI-based proctoring system for secure online examinations with face recognition and behavior analysis.',
    teamName: 'Team Epsilon',
    teamLeader: 'Kevin Nguyen',
    teamMembers: ['Kevin Nguyen', 'Amy Zhang'],
    department: 'Computer Science',
    status: 'submitted',
    advisorId: null,
    advisorName: null,
    submittedAt: '2026-01-22',
    updatedAt: '2026-01-22',
  },
];

// GET /users?role=advisor&department_id={dept_id}
const mockAdvisors: Advisor[] = [
  {
    id: 't1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Computer Science',
    specialization: 'Artificial Intelligence & Machine Learning',
    assignedProposals: 2,
    maxCapacity: 5,
    available: true,
  },
  {
    id: 't2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    department: 'Computer Science',
    specialization: 'Software Engineering & Systems Design',
    assignedProposals: 4,
    maxCapacity: 5,
    available: true,
  },
  {
    id: 't3',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@university.edu',
    department: 'Computer Science',
    specialization: 'Cybersecurity & Blockchain',
    assignedProposals: 1,
    maxCapacity: 4,
    available: true,
  },
  {
    id: 't4',
    name: 'Prof. David Park',
    email: 'david.park@university.edu',
    department: 'Computer Science',
    specialization: 'Mobile & Web Development',
    assignedProposals: 3,
    maxCapacity: 4,
    available: true,
  },
  {
    id: 't5',
    name: 'Dr. Lisa Wang',
    email: 'lisa.wang@university.edu',
    department: 'Computer Science',
    specialization: 'Data Science & Analytics',
    assignedProposals: 5,
    maxCapacity: 5,
    available: false,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================
const getStatusBadge = (status: Proposal['status']) => {
  const statusConfig = {
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
    revision_needed: {
      label: 'Needs Revision',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: RefreshCw,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// ============================================================================
// Main Component
// ============================================================================
export default function AssignmentsPage() {
  const { toast } = useToast();

  // State
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
  const [advisors] = useState<Advisor[]>(mockAdvisors);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null,
  );
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading] = useState(false);

  // Computed values
  const stats = useMemo(
    () => ({
      total: proposals.length,
      pendingAssignment: proposals.filter(
        (p) => p.status === 'submitted' && !p.advisorId,
      ).length,
      underReview: proposals.filter((p) => p.status === 'under_review').length,
      approved: proposals.filter((p) => p.status === 'approved').length,
    }),
    [proposals],
  );

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const matchesSearch =
        proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.teamLeader.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || proposal.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchQuery, statusFilter]);

  const availableAdvisors = useMemo(() => {
    return advisors.filter((a) => a.assignedProposals < a.maxCapacity);
  }, [advisors]);

  // Handlers
  const handleAssignClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setSelectedAdvisorId('');
    setShowAssignDialog(true);
  };

  const handleViewDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowDetailsDialog(true);
  };

  const confirmAssignment = async () => {
    if (!selectedProposal || !selectedAdvisorId) return;

    const advisor = advisors.find((a) => a.id === selectedAdvisorId);
    if (!advisor) return;

    // In production: PATCH /proposals/{id}/assign with { advisor_id: selectedAdvisorId }
    // For now, update local state
    setProposals((prev) =>
      prev.map((p) =>
        p.id === selectedProposal.id
          ? {
              ...p,
              advisorId: advisor.id,
              advisorName: advisor.name,
              status: 'under_review' as const,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : p,
      ),
    );

    toast({
      title: 'Advisor Assigned Successfully',
      description: `${advisor.name} has been assigned to "${selectedProposal.title}".`,
    });

    setShowAssignDialog(false);
    setSelectedProposal(null);
    setSelectedAdvisorId('');
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              Proposal Assignments
            </h1>
            <p className="text-muted-foreground mt-1">
              Assign faculty advisors to submitted capstone proposals
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <Building2 className="h-4 w-4" />
            Computer Science Department
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending Assignment
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">
                {stats.pendingAssignment}
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
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Total Proposals
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {stats.total}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Advisor Availability Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Available Advisors
            </CardTitle>
            <CardDescription>
              Faculty members available for new proposal assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {advisors.map((advisor) => {
                const isFull = advisor.assignedProposals >= advisor.maxCapacity;
                return (
                  <div
                    key={advisor.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isFull
                        ? 'bg-muted/30 opacity-60'
                        : 'bg-card hover:shadow-md hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={`text-sm ${
                            isFull
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {getInitials(advisor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {advisor.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {advisor.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Capacity
                      </span>
                      <Badge
                        variant={isFull ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {advisor.assignedProposals} / {advisor.maxCapacity}
                      </Badge>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull
                            ? 'bg-red-500'
                            : advisor.assignedProposals >=
                                advisor.maxCapacity * 0.75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${(advisor.assignedProposals / advisor.maxCapacity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Proposals Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Submitted Proposals
                </CardTitle>
                <CardDescription>
                  Review and assign advisors to student proposals
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search proposals..."
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
                    <SelectItem value="all">All Proposals</SelectItem>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No Proposals Found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No proposals have been submitted yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">Proposal</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Advisor</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProposals.map((proposal) => (
                      <TableRow key={proposal.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium line-clamp-1">
                              {proposal.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {proposal.abstract}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(proposal.teamName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {proposal.teamName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {proposal.teamMembers.length} members
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                        <TableCell>
                          {proposal.advisorName ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                  {getInitials(proposal.advisorName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {proposal.advisorName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {proposal.submittedAt}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8"
                              onClick={() => handleViewDetails(proposal)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!proposal.advisorId &&
                              proposal.status === 'submitted' && (
                                <Button
                                  size="sm"
                                  className="rounded-full gap-1 h-8"
                                  onClick={() => handleAssignClick(proposal)}
                                >
                                  <Link2 className="h-3 w-3" />
                                  Assign
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Advisor Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Assign Advisor
            </DialogTitle>
            <DialogDescription>
              Select a faculty advisor for this proposal. The advisor will
              review and guide the team.
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4 py-4">
              {/* Proposal Info */}
              <div className="p-4 rounded-xl bg-muted/30 space-y-2">
                <p className="font-semibold">{selectedProposal.title}</p>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {selectedProposal.teamName}
                  </span>
                  <span>•</span>
                  <span>Leader: {selectedProposal.teamLeader}</span>
                  <span>•</span>
                  <span>{selectedProposal.teamMembers.length} members</span>
                </div>
              </div>

              {/* Advisor Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Advisor</label>
                <Select
                  value={selectedAdvisorId}
                  onValueChange={setSelectedAdvisorId}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose an advisor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAdvisors.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No advisors available at the moment.
                      </div>
                    ) : (
                      availableAdvisors.map((advisor) => (
                        <SelectItem key={advisor.id} value={advisor.id}>
                          <div className="flex items-center gap-2">
                            <span>{advisor.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {advisor.assignedProposals}/{advisor.maxCapacity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Advisor Preview */}
              {selectedAdvisorId && (
                <div className="p-4 rounded-xl border bg-card">
                  {(() => {
                    const advisor = advisors.find(
                      (a) => a.id === selectedAdvisorId,
                    );
                    if (!advisor) return null;
                    return (
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(advisor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium">{advisor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {advisor.email}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {advisor.specialization}
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full"
              onClick={confirmAssignment}
              disabled={!selectedAdvisorId}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proposal Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Proposal Details
            </DialogTitle>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-6 py-4">
              {/* Title and Status */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">
                    {selectedProposal.title}
                  </h3>
                  {getStatusBadge(selectedProposal.status)}
                </div>
              </div>

              {/* Abstract */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Abstract
                </h4>
                <p className="text-sm leading-relaxed">
                  {selectedProposal.abstract}
                </p>
              </div>

              {/* Team Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Team Information
                </h4>
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedProposal.teamName}</p>
                      <p className="text-sm text-muted-foreground">
                        Led by {selectedProposal.teamLeader}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.teamMembers.map((member, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advisor Info */}
              {selectedProposal.advisorName && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Assigned Advisor
                  </h4>
                  <div className="flex items-center gap-3 p-4 rounded-xl border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {getInitials(selectedProposal.advisorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedProposal.advisorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Faculty Advisor
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Submitted: {selectedProposal.submittedAt}
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Updated: {selectedProposal.updatedAt}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedProposal &&
              !selectedProposal.advisorId &&
              selectedProposal.status === 'submitted' && (
                <Button
                  className="rounded-full"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    handleAssignClick(selectedProposal);
                  }}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Assign Advisor
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
