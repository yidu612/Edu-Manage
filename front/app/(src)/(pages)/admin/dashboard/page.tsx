'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  FileText,
  UserPlus,
  Clock,
  CheckCircle,
  Eye,
  ArrowRight,
  Building2,
  GraduationCap,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================
interface Proposal {
  id: string;
  title: string;
  teamName: string;
  teamLeader: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  advisorName: string | null;
  submittedAt: string;
}

interface Advisor {
  id: string;
  name: string;
  assignedCount: number;
  maxCapacity: number;
}

// ============================================================================
// Mock Data
// ============================================================================
const mockProposals: Proposal[] = [
  {
    id: 'p1',
    title: 'AI-Powered Student Performance Analytics',
    teamName: 'Team Alpha',
    teamLeader: 'John Doe',
    status: 'submitted',
    advisorName: null,
    submittedAt: '2026-01-22',
  },
  {
    id: 'p2',
    title: 'Blockchain Certificate Verification',
    teamName: 'Team Beta',
    teamLeader: 'Alice Brown',
    status: 'submitted',
    advisorName: null,
    submittedAt: '2026-01-21',
  },
  {
    id: 'p3',
    title: 'Smart Campus Navigation App',
    teamName: 'Team Gamma',
    teamLeader: 'David Park',
    status: 'under_review',
    advisorName: 'Dr. Sarah Johnson',
    submittedAt: '2026-01-18',
  },
  {
    id: 'p4',
    title: 'Library Management System',
    teamName: 'Team Delta',
    teamLeader: 'Emma Wilson',
    status: 'approved',
    advisorName: 'Prof. Michael Chen',
    submittedAt: '2026-01-15',
  },
];

const mockAdvisors: Advisor[] = [
  { id: 't1', name: 'Dr. Sarah Johnson', assignedCount: 3, maxCapacity: 5 },
  { id: 't2', name: 'Prof. Michael Chen', assignedCount: 5, maxCapacity: 5 },
  { id: 't3', name: 'Dr. Emily Davis', assignedCount: 2, maxCapacity: 4 },
  { id: 't4', name: 'Prof. David Park', assignedCount: 4, maxCapacity: 4 },
];

// ============================================================================
// Helpers
// ============================================================================
const getStatusBadge = (status: Proposal['status']) => {
  const config = {
    submitted: {
      label: 'Pending',
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
export default function DepartmentHeadDashboard() {
  const stats = useMemo(
    () => ({
      pendingAssignment: mockProposals.filter((p) => p.status === 'submitted')
        .length,
      underReview: mockProposals.filter((p) => p.status === 'under_review')
        .length,
      approved: mockProposals.filter((p) => p.status === 'approved').length,
      totalTeams: mockProposals.length,
      availableAdvisors: mockAdvisors.filter(
        (a) => a.assignedCount < a.maxCapacity,
      ).length,
    }),
    [],
  );

  const recentPendingProposals = mockProposals
    .filter((p) => p.status === 'submitted')
    .slice(0, 3);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              Department Head Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage advisor assignments and monitor proposal progress
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <GraduationCap className="h-4 w-4" />
            Computer Science Department
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Needs Assignment
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
                <Users className="h-4 w-4" /> Total Teams
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {stats.totalTeams}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-green-50/50 border-green-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700 font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Available Advisors
              </CardDescription>
              <CardTitle className="text-3xl text-green-900">
                {stats.availableAdvisors}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Proposals Needing Assignment */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Proposals Awaiting Assignment
                  </CardTitle>
                  <CardDescription>
                    These proposals need an advisor assigned
                  </CardDescription>
                </div>
                <Button asChild className="rounded-full gap-2">
                  <Link href="/admin/assignments">
                    <UserPlus className="h-4 w-4" />
                    Assign Now
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentPendingProposals.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-semibold">All Caught Up!</h3>
                    <p className="text-muted-foreground text-sm">
                      No proposals awaiting assignment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPendingProposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-amber-700" />
                          </div>
                          <div>
                            <p className="font-medium">{proposal.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {proposal.teamName} • {proposal.teamLeader}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {proposal.submittedAt}
                          </span>
                          {getStatusBadge(proposal.status)}
                        </div>
                      </div>
                    ))}
                    {stats.pendingAssignment > 3 && (
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href="/admin/assignments">
                          View all {stats.pendingAssignment} pending proposals
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Assign Advisors</h3>
                      <p className="text-sm text-muted-foreground">
                        Assign faculty to student proposals
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      asChild
                    >
                      <Link href="/admin/assignments">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">View Teams</h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor all student teams
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      asChild
                    >
                      <Link href="/admin/teams">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Advisor Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Advisor Workload
              </CardTitle>
              <CardDescription>Current assignment distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAdvisors.map((advisor) => {
                const isFull = advisor.assignedCount >= advisor.maxCapacity;
                const percentage =
                  (advisor.assignedCount / advisor.maxCapacity) * 100;
                return (
                  <div key={advisor.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={`text-xs ${
                              isFull
                                ? 'bg-red-100 text-red-700'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {getInitials(advisor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate max-w-[120px]">
                          {advisor.name}
                        </span>
                      </div>
                      <Badge
                        variant={isFull ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {advisor.assignedCount}/{advisor.maxCapacity}
                      </Badge>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull
                            ? 'bg-red-500'
                            : percentage >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <Button
                variant="outline"
                className="w-full mt-4 rounded-full"
                asChild
              >
                <Link href="/admin/advisors">
                  View All Advisors
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
