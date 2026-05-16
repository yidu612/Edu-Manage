'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
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
  GraduationCap,
  FileText,
  Building2,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  studentId?: { id: string; name?: string; fullName?: string; department?: string };
  mentorId?: { id: string; name?: string; fullName?: string } | null;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  submitted:    { label: 'Pending Assignment', color: 'bg-amber-100 text-amber-700 border-amber-200',   Icon: Clock },
  under_review: { label: 'Under Review',       color: 'bg-blue-100 text-blue-700 border-blue-200',      Icon: Eye },
  approved:     { label: 'Approved',           color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle },
  rejected:     { label: 'Rejected',           color: 'bg-red-100 text-red-700 border-red-200',         Icon: AlertCircle },
  draft:        { label: 'Draft',              color: 'bg-gray-100 text-gray-700 border-gray-200',       Icon: FileText },
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export default function TeamsOverviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data, isLoading } = useSWR('/projects', fetcher);
  const projects: Project[] = data?.data ?? [];

  const stats = useMemo(() => ({
    total:       projects.length,
    pending:     projects.filter((p) => p.status === 'submitted').length,
    underReview: projects.filter((p) => p.status === 'under_review').length,
    approved:    projects.filter((p) => p.status === 'approved').length,
  }), [projects]);

  const filtered = useMemo(() => projects.filter((p) => {
    const studentName = p.studentId?.name ?? p.studentId?.fullName ?? '';
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.studentId?.department ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [projects, searchQuery, statusFilter]);

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
              Student Projects
            </h1>
            <p className="text-muted-foreground mt-1">
              View all student projects in your department
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <Building2 className="h-4 w-4" />
            {projects.length} projects
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Total
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
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
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">All Projects</CardTitle>
                <CardDescription>Student projects across all departments</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects or students..."
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
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Pending Assignment</SelectItem>
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
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No Projects Found</h3>
                <p className="text-muted-foreground mt-1">
                  {projects.length === 0
                    ? 'No student projects yet.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((project) => {
                  const cfg = statusConfig[project.status] ?? statusConfig.draft;
                  const studentName =
                    project.studentId?.name ?? project.studentId?.fullName ?? '—';
                  const advisorName = project.mentorId?.name ?? project.mentorId?.fullName;
                  return (
                    <Card
                      key={project.id}
                      className="hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                      onClick={() => setSelectedProject(project)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold line-clamp-1">{project.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {studentName}
                                {project.studentId?.department ? ` · ${project.studentId.department}` : ''}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`gap-1 shrink-0 text-xs ${cfg.color}`}>
                            <cfg.Icon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                          {advisorName ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                  {getInitials(advisorName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{advisorName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600">No advisor assigned</span>
                          )}
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

      {/* Project Details Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(o) => !o && setSelectedProject(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Project Details
            </DialogTitle>
            <DialogDescription>Complete information about this project</DialogDescription>
          </DialogHeader>

          {selectedProject && (() => {
            const cfg = statusConfig[selectedProject.status] ?? statusConfig.draft;
            const studentName =
              selectedProject.studentId?.name ?? selectedProject.studentId?.fullName ?? '—';
            const advisorName =
              selectedProject.mentorId?.name ?? selectedProject.mentorId?.fullName;
            return (
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedProject.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(selectedProject.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                    <cfg.Icon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>

                {/* Student */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Student</h4>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(studentName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{studentName}</p>
                      {selectedProject.studentId?.department && (
                        <p className="text-xs text-muted-foreground">
                          {selectedProject.studentId.department}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advisor */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Assigned Advisor</h4>
                  {advisorName ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {getInitials(advisorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{advisorName}</p>
                        <p className="text-sm text-muted-foreground">Faculty Advisor</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed text-center">
                      <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No advisor assigned yet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
