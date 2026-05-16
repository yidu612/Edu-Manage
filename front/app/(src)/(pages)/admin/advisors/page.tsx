'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  GraduationCap, Search, Users, Mail, BookOpen, Eye, CheckCircle, Building2, Loader2,
} from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Teacher = { id: string; name?: string; fullName?: string; email: string; department?: string };
type Project = {
  id: string; title: string; status: string;
  mentorId?: { id: string } | null;
  studentId?: { name?: string; fullName?: string };
  createdAt: string;
};

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdvisorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const { data: teachersData, isLoading: loadingTeachers } = useSWR('/users/teachers', fetcher);
  const { data: projectsData } = useSWR('/projects', fetcher);

  const teachers: Teacher[] = teachersData?.data ?? [];
  const projects: Project[] = projectsData?.data ?? [];

  const stats = useMemo(() => {
    const assigned = teachers.filter((t) => projects.some((p) => p.mentorId?.id === t.id)).length;
    return {
      total: teachers.length,
      assigned,
      available: teachers.length - assigned,
      totalProjects: projects.length,
    };
  }, [teachers, projects]);

  const filtered = useMemo(() =>
    teachers.filter((t) => {
      const name = t.fullName ?? t.name ?? '';
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.department ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
    [teachers, searchQuery]
  );

  const getAssignedProjects = (teacherId: string) =>
    projects.filter((p) => p.mentorId?.id === teacherId);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><GraduationCap className="h-6 w-6 text-primary" /></div>
              Advisors
            </h1>
            <p className="text-muted-foreground mt-1">Manage faculty advisors and their assigned projects</p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <Building2 className="h-4 w-4" />All Departments
          </Badge>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Total Advisors</CardDescription>
              <CardTitle className="text-3xl text-purple-900">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Available</CardDescription>
              <CardTitle className="text-3xl text-emerald-900">{stats.available}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2"><Users className="h-4 w-4" /> With Projects</CardDescription>
              <CardTitle className="text-3xl text-blue-900">{stats.assigned}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2"><BookOpen className="h-4 w-4" /> Total Projects</CardDescription>
              <CardTitle className="text-3xl text-amber-900">{stats.totalProjects}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Faculty Advisors</CardTitle>
                <CardDescription>View advisor details and their assigned projects</CardDescription>
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
            {loadingTeachers ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{teachers.length === 0 ? 'No Advisors Found' : 'No Results'}</h3>
                <p className="text-muted-foreground mt-1">{teachers.length === 0 ? 'No faculty members are registered yet.' : 'Try adjusting your search.'}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((teacher) => {
                  const assigned = getAssignedProjects(teacher.id);
                  const name = teacher.fullName ?? teacher.name ?? teacher.email;
                  return (
                    <Card
                      key={teacher.id}
                      className="hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{teacher.department ?? 'Faculty'}</p>
                          </div>
                          <Badge variant="outline" className={assigned.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}>
                            {assigned.length > 0 ? `${assigned.length} assigned` : 'Available'}
                          </Badge>
                        </div>

                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {assigned.filter((p) => p.status === 'under_review' || p.status === 'submitted').length} reviewing
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {assigned.filter((p) => p.status === 'approved').length} approved
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

      <Dialog open={!!selectedTeacher} onOpenChange={(o) => { if (!o) setSelectedTeacher(null); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />Advisor Details
            </DialogTitle>
            <DialogDescription>Contact information and assigned projects</DialogDescription>
          </DialogHeader>

          {selectedTeacher && (() => {
            const name = selectedTeacher.fullName ?? selectedTeacher.name ?? selectedTeacher.email;
            const assigned = getAssignedProjects(selectedTeacher.id);
            return (
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">{getInitials(name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{name}</h3>
                    {selectedTeacher.department && <Badge variant="secondary">{selectedTeacher.department}</Badge>}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedTeacher.email}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Assigned Projects ({assigned.length})</h4>
                  {assigned.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed text-center">
                      <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No projects assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {assigned.map((p) => {
                        const studentName = p.studentId?.fullName ?? p.studentId?.name ?? '—';
                        return (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                              <p className="text-xs text-muted-foreground">{studentName}</p>
                            </div>
                            <Badge variant="outline" className={
                              p.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                              p.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-blue-100 text-blue-700 border-blue-200'
                            }>
                              {p.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        );
                      })}
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
