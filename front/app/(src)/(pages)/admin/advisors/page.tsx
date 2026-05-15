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
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  GraduationCap,
  Search,
  Users,
  Mail,
  Phone,
  BookOpen,
  Eye,
  CheckCircle,
  Building2,
  Calendar,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================
interface AssignedTeam {
  id: string;
  teamName: string;
  proposalTitle: string;
  status: 'under_review' | 'approved';
  assignedDate: string;
}

interface Advisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  maxCapacity: number;
  assignedTeams: AssignedTeam[];
}

// ============================================================================
// Mock Data
// ============================================================================
const mockAdvisors: Advisor[] = [
  {
    id: 'a1',
    name: 'Dr. Sarah Johnson',
    email: 's.johnson@university.edu',
    phone: '+1 (555) 123-4567',
    specialization: 'Machine Learning & AI',
    maxCapacity: 4,
    assignedTeams: [
      {
        id: 't3',
        teamName: 'Team Gamma',
        proposalTitle: 'Smart Campus Navigation App',
        status: 'under_review',
        assignedDate: '2026-01-08',
      },
    ],
  },
  {
    id: 'a2',
    name: 'Prof. Michael Chen',
    email: 'm.chen@university.edu',
    phone: '+1 (555) 234-5678',
    specialization: 'Software Engineering',
    maxCapacity: 5,
    assignedTeams: [
      {
        id: 't4',
        teamName: 'Team Delta',
        proposalTitle: 'Library Management System',
        status: 'approved',
        assignedDate: '2026-01-05',
      },
      {
        id: 't6',
        teamName: 'Team Zeta',
        proposalTitle: 'E-Learning Platform',
        status: 'under_review',
        assignedDate: '2026-01-12',
      },
    ],
  },
  {
    id: 'a3',
    name: 'Dr. Emily Davis',
    email: 'e.davis@university.edu',
    phone: '+1 (555) 345-6789',
    specialization: 'Cybersecurity',
    maxCapacity: 3,
    assignedTeams: [
      {
        id: 't5',
        teamName: 'Team Epsilon',
        proposalTitle: 'Online Exam Proctoring System',
        status: 'under_review',
        assignedDate: '2026-01-15',
      },
    ],
  },
  {
    id: 'a4',
    name: 'Prof. David Lee',
    email: 'd.lee@university.edu',
    phone: '+1 (555) 456-7890',
    specialization: 'Data Science',
    maxCapacity: 4,
    assignedTeams: [],
  },
  {
    id: 'a5',
    name: 'Dr. Maria Rodriguez',
    email: 'm.rodriguez@university.edu',
    phone: '+1 (555) 567-8901',
    specialization: 'Web Technologies',
    maxCapacity: 4,
    assignedTeams: [
      {
        id: 't7',
        teamName: 'Team Eta',
        proposalTitle: 'Student Portal Redesign',
        status: 'approved',
        assignedDate: '2026-01-03',
      },
      {
        id: 't8',
        teamName: 'Team Theta',
        proposalTitle: 'Campus Event App',
        status: 'under_review',
        assignedDate: '2026-01-10',
      },
      {
        id: 't9',
        teamName: 'Team Iota',
        proposalTitle: 'Online Marketplace for Students',
        status: 'under_review',
        assignedDate: '2026-01-14',
      },
    ],
  },
];

// ============================================================================
// Helpers
// ============================================================================
const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const getCapacityColor = (current: number, max: number) => {
  const ratio = current / max;
  if (ratio >= 1) return 'text-red-600';
  if (ratio >= 0.75) return 'text-amber-600';
  return 'text-emerald-600';
};

const getProgressColor = (current: number, max: number) => {
  const ratio = current / max;
  if (ratio >= 1) return 'bg-red-500';
  if (ratio >= 0.75) return 'bg-amber-500';
  return 'bg-emerald-500';
};

// ============================================================================
// Component
// ============================================================================
export default function AdvisorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const stats = useMemo(() => {
    const totalAdvisors = mockAdvisors.length;
    const totalCapacity = mockAdvisors.reduce(
      (sum, a) => sum + a.maxCapacity,
      0,
    );
    const totalAssigned = mockAdvisors.reduce(
      (sum, a) => sum + a.assignedTeams.length,
      0,
    );
    const availableSlots = totalCapacity - totalAssigned;
    const availableAdvisors = mockAdvisors.filter(
      (a) => a.assignedTeams.length < a.maxCapacity,
    ).length;
    return {
      totalAdvisors,
      totalCapacity,
      totalAssigned,
      availableSlots,
      availableAdvisors,
    };
  }, []);

  const filteredAdvisors = useMemo(() => {
    return mockAdvisors.filter(
      (advisor) =>
        advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.specialization
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const handleViewDetails = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
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
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              Advisors
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage advisors and their assigned teams
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
                <GraduationCap className="h-4 w-4" /> Total Advisors
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {stats.totalAdvisors}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Available
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">
                {stats.availableAdvisors}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Assigned
              </CardDescription>
              <CardTitle className="text-3xl text-blue-900">
                {stats.totalAssigned}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Available Slots
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">
                {stats.availableSlots}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Department Advisors</CardTitle>
                <CardDescription>
                  View advisor details and their workload
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search advisors..."
                  className="pl-10 rounded-full w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAdvisors.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No Advisors Found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search criteria.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAdvisors.map((advisor) => {
                  const capacityRatio =
                    advisor.assignedTeams.length / advisor.maxCapacity;
                  const isFull =
                    advisor.assignedTeams.length >= advisor.maxCapacity;

                  return (
                    <Card
                      key={advisor.id}
                      className={`hover:shadow-md transition-all cursor-pointer hover:border-primary/20 ${
                        isFull ? 'border-red-100 bg-red-50/20' : ''
                      }`}
                      onClick={() => handleViewDetails(advisor)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(advisor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">
                              {advisor.name}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {advisor.specialization}
                            </p>
                          </div>
                          {isFull ? (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-700 border-red-200"
                            >
                              Full
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-100 text-emerald-700 border-emerald-200"
                            >
                              Available
                            </Badge>
                          )}
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Workload
                            </span>
                            <span
                              className={`font-semibold ${getCapacityColor(advisor.assignedTeams.length, advisor.maxCapacity)}`}
                            >
                              {advisor.assignedTeams.length} /{' '}
                              {advisor.maxCapacity} teams
                            </span>
                          </div>
                          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`absolute left-0 top-0 h-full transition-all ${getProgressColor(advisor.assignedTeams.length, advisor.maxCapacity)}`}
                              style={{
                                width: `${Math.min(capacityRatio * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {
                              advisor.assignedTeams.filter(
                                (t) => t.status === 'under_review',
                              ).length
                            }{' '}
                            reviewing
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {
                              advisor.assignedTeams.filter(
                                (t) => t.status === 'approved',
                              ).length
                            }{' '}
                            approved
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advisor Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Advisor Details
            </DialogTitle>
            <DialogDescription>
              Contact information and assigned teams
            </DialogDescription>
          </DialogHeader>

          {selectedAdvisor && (
            <div className="space-y-6 py-4">
              {/* Advisor Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {getInitials(selectedAdvisor.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedAdvisor.name}
                  </h3>
                  <Badge variant="secondary">
                    {selectedAdvisor.specialization}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedAdvisor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedAdvisor.phone}</span>
                  </div>
                </div>
              </div>

              {/* Workload */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Current Workload
                </h4>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Capacity</span>
                      <span
                        className={`font-semibold ${getCapacityColor(selectedAdvisor.assignedTeams.length, selectedAdvisor.maxCapacity)}`}
                      >
                        {selectedAdvisor.assignedTeams.length} /{' '}
                        {selectedAdvisor.maxCapacity}
                      </span>
                    </div>
                    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full transition-all ${getProgressColor(selectedAdvisor.assignedTeams.length, selectedAdvisor.maxCapacity)}`}
                        style={{
                          width: `${Math.min((selectedAdvisor.assignedTeams.length / selectedAdvisor.maxCapacity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assigned Teams */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Assigned Teams ({selectedAdvisor.assignedTeams.length})
                </h4>
                {selectedAdvisor.assignedTeams.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed text-center">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No teams assigned yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedAdvisor.assignedTeams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-sm">{team.teamName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {team.proposalTitle}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant="outline"
                            className={
                              team.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                            }
                          >
                            {team.status === 'approved'
                              ? 'Approved'
                              : 'Reviewing'}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {team.assignedDate}
                          </span>
                        </div>
                      </div>
                    ))}
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
