'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
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
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  mentorId?: { id: string; name?: string; fullName?: string } | null;
  team?: { id?: string; name?: string } | null;
  student?: { id?: string; name?: string; fullName?: string } | null;
  createdAt: string;
};

type Teacher = {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
};

const statusConfig: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  submitted:    { label: 'Pending',      color: 'bg-amber-100 text-amber-700 border-amber-200',   Icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 border-blue-200',      Icon: Eye },
  approved:     { label: 'Approved',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle },
  rejected:     { label: 'Rejected',     color: 'bg-red-100 text-red-700 border-red-200',         Icon: AlertCircle },
  draft:        { label: 'Draft',        color: 'bg-gray-100 text-gray-700 border-gray-200',       Icon: FileText },
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export default function AdminDashboard() {
  const { data: projectsData, isLoading: loadingProjects } = useSWR('/projects', fetcher);
  const { data: teachersData } = useSWR('/users/teachers', fetcher);

  const projects: Project[] = projectsData?.data ?? [];
  const teachers: Teacher[] = teachersData?.data ?? [];

  const stats = useMemo(() => ({
    needsAssignment: projects.filter((p) => !p.mentorId).length,
    underReview:     projects.filter((p) => p.status === 'under_review').length,
    approved:        projects.filter((p) => p.status === 'approved').length,
    total:           projects.length,
    teachers:        teachers.length,
  }), [projects, teachers]);

  const unassignedProjects = projects.filter((p) => !p.mentorId).slice(0, 3);

  const advisorWorkload = useMemo(() =>
    teachers.slice(0, 5).map((t) => ({
      id:    t.id,
      name:  t.name ?? t.fullName ?? t.email,
      count: projects.filter((p) => p.mentorId?.id === t.id).length,
    })),
    [teachers, projects],
  );

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
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage advisor assignments and monitor project progress
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <GraduationCap className="h-4 w-4" />
            {stats.teachers} Advisors
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
                {loadingProjects ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.needsAssignment}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" /> Under Review
              </CardDescription>
              <CardTitle className="text-3xl text-blue-900">
                {loadingProjects ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.underReview}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Approved
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">
                {loadingProjects ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.approved}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Projects
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {loadingProjects ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-green-50/50 border-green-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700 font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Advisors
              </CardDescription>
              <CardTitle className="text-3xl text-green-900">
                {stats.teachers}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Projects Needing Assignment */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Projects Awaiting Assignment
                  </CardTitle>
                  <CardDescription>
                    These projects need an advisor assigned
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
                {loadingProjects ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : unassignedProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-semibold">All Caught Up!</h3>
                    <p className="text-muted-foreground text-sm">
                      No projects awaiting assignment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unassignedProjects.map((project) => {
                      const cfg = statusConfig[project.status] ?? statusConfig.submitted;
                      const submitterName =
                        project.student?.name ?? project.student?.fullName ??
                        project.team?.name ?? '—';
                      return (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5 text-amber-700" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{project.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {submitterName} • {new Date(project.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge variant="outline" className={`gap-1 text-xs ${cfg.color}`}>
                              <cfg.Icon className="h-3 w-3" />
                              {cfg.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    {stats.needsAssignment > 3 && (
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href="/admin/assignments">
                          View all {stats.needsAssignment} unassigned projects
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
                        Assign faculty to student projects
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full" asChild>
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
                      <h3 className="font-semibold">Manage Users</h3>
                      <p className="text-sm text-muted-foreground">
                        View and manage all users
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full" asChild>
                      <Link href="/admin/users">
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
              <CardDescription>Current project assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {advisorWorkload.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No advisors found.
                </p>
              ) : (
                advisorWorkload.map((advisor) => (
                  <div key={advisor.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(advisor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{advisor.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {advisor.count} project{advisor.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full mt-4 rounded-full" asChild>
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
