'use client';

import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Eye,
  GraduationCap,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  studentId?: { id: string; name?: string; fullName?: string; department?: string; email?: string };
  mentorId?: { id: string; name?: string } | null;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  draft:        { label: 'Draft',        color: 'bg-gray-100 text-gray-700',         Icon: FileText },
  submitted:    { label: 'Submitted',    color: 'bg-amber-100 text-amber-700',        Icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700',          Icon: Eye },
  approved:     { label: 'Approved',     color: 'bg-emerald-100 text-emerald-700',    Icon: CheckCircle },
  rejected:     { label: 'Rejected',     color: 'bg-red-100 text-red-700',            Icon: AlertCircle },
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function TeacherTeamsPage() {
  const { data, isLoading } = useSWR('/projects', fetcher);
  const projects: Project[] = data?.data ?? [];

  const stats = {
    total:       projects.length,
    underReview: projects.filter((p) => p.status === 'under_review').length,
    approved:    projects.filter((p) => p.status === 'approved').length,
    students:    new Set(projects.map((p) => p.studentId?.id).filter(Boolean)).size,
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Assigned Projects</h1>
          <p className="text-muted-foreground">
            Projects assigned to you as mentor/advisor.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" /> Under Review
              </CardDescription>
              <CardTitle className="text-3xl text-blue-900">{stats.underReview}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Approved
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">{stats.approved}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Total Projects
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Students
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">{stats.students}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Project list */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-semibold text-lg">No projects assigned yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                The admin will assign student projects to you as their mentor.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const cfg = statusConfig[project.status] ?? statusConfig.draft;
              const studentName =
                project.studentId?.name ?? project.studentId?.fullName ?? '—';
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-all hover:border-primary/20"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold line-clamp-1">{project.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-xs border-0 ${cfg.color} shrink-0`}>
                        <cfg.Icon className="h-3 w-3 mr-1" />
                        {cfg.label}
                      </Badge>
                    </div>

                    {/* Student */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{studentName}</p>
                        {project.studentId?.department && (
                          <p className="text-xs text-muted-foreground">
                            {project.studentId.department}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
