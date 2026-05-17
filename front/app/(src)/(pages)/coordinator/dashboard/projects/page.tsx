'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Loader2, FileText, Building2 } from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  title: string;
  status: string;
  abstract?: string;
  studentId?: { name?: string; fullName?: string; email?: string; department?: string };
  mentorId?:  { name?: string; fullName?: string } | null;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft:        { label: 'Draft',        color: 'bg-gray-100 text-gray-700 border-gray-200' },
  submitted:    { label: 'Submitted',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  approved:     { label: 'Approved',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected:     { label: 'Rejected',     color: 'bg-red-100 text-red-700 border-red-200' },
};

function initials(name?: string) {
  return (name ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function CoordinatorProjectsPage() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');

  const { data, isLoading } = useSWR('/coordinator/projects', fetcher);
  const projects: Project[] = data?.data ?? [];

  const filtered = projects.filter((p) => {
    const studentName = p.studentId?.name ?? p.studentId?.fullName ?? '';
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
      || studentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Department Projects</h1>
          <p className="text-muted-foreground">All student projects within your department</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or student name..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-semibold text-lg">
                {projects.length === 0 ? 'No projects in your department yet.' : 'No projects match your search.'}
              </h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((project) => {
              const cfg = statusConfig[project.status] ?? statusConfig.draft;
              const studentName = project.studentId?.name ?? project.studentId?.fullName ?? '—';
              const mentorName  = project.mentorId?.name ?? project.mentorId?.fullName ?? null;

              return (
                <Card key={project.id} className="hover:shadow-md transition-all hover:border-orange-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <Badge variant="outline" className={`border gap-1 ${cfg.color}`}>
                          <FileText className="h-3 w-3" />{cfg.label}
                        </Badge>
                        <CardTitle className="text-lg font-bold">{project.title}</CardTitle>
                      </div>
                      <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-gray-100 shrink-0">
                        <AvatarFallback className="text-[11px] bg-orange-100 text-orange-700 font-medium">
                          {initials(studentName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.abstract && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.abstract}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <span>Student: <span className="font-medium text-foreground">{studentName}</span></span>
                      {project.studentId?.department && (
                        <span>Dept: <span className="font-medium text-foreground">{project.studentId.department}</span></span>
                      )}
                      {mentorName && (
                        <span>Mentor: <span className="font-medium text-foreground">{mentorName}</span></span>
                      )}
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
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
