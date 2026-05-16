'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
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
  Building2,
  Users,
  FileText,
  CheckCircle,
  Clock,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type UserRecord = {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  department?: string;
};

type Project = {
  id: string;
  title: string;
  status: string;
  studentId?: { id: string; name?: string; department?: string };
  mentorId?: { id: string; name?: string } | null;
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function DepartmentsPage() {
  const { data: usersData, isLoading: loadingUsers } = useSWR('/users', fetcher);
  const { data: projectsData, isLoading: loadingProjects } = useSWR('/projects', fetcher);

  const users: UserRecord[] = usersData?.data ?? [];
  const projects: Project[] = projectsData?.data ?? [];

  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

  const departments = useMemo(() => {
    const deptNames = new Set([
      ...students.map((s) => s.department ?? 'Unspecified'),
      ...teachers.map((t) => t.department ?? 'Unspecified'),
    ]);

    return Array.from(deptNames).sort().map((dept) => {
      const deptStudents = students.filter((s) => (s.department ?? 'Unspecified') === dept);
      const deptTeachers = teachers.filter((t) => (t.department ?? 'Unspecified') === dept);
      const deptStudentIds = new Set(deptStudents.map((s) => s.id));
      const deptProjects = projects.filter((p) => deptStudentIds.has(p.studentId?.id ?? ''));

      return {
        name: dept,
        students: deptStudents.length,
        teachers: deptTeachers.length,
        projects: deptProjects.length,
        approved: deptProjects.filter((p) => p.status === 'approved').length,
        pending:  deptProjects.filter((p) => p.status === 'submitted' || p.status === 'under_review').length,
        teacherList: deptTeachers,
        recentProjects: deptProjects.slice(0, 3),
      };
    });
  }, [students, teachers, projects]);

  const isLoading = loadingUsers || loadingProjects;

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
              Departments
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of departments, their students, advisors, and projects
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <Building2 className="h-4 w-4" />
            {departments.length} departments
          </Badge>
        </div>

        {/* Summary stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Departments
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">{departments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Students
              </CardDescription>
              <CardTitle className="text-3xl text-blue-900">{students.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Advisors
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">{teachers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Projects
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">{projects.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Department Cards */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : departments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No departments found.</p>
              <p className="text-sm mt-1">Departments are inferred from registered users.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {departments.map((dept) => (
              <Card key={dept.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      {dept.name}
                    </CardTitle>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" /> {dept.students}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <GraduationCap className="h-3 w-3" /> {dept.teachers}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Project stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xl font-bold">{dept.projects}</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-emerald-50">
                      <p className="text-xl font-bold text-emerald-700">{dept.approved}</p>
                      <p className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Approved
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-amber-50">
                      <p className="text-xl font-bold text-amber-700">{dept.pending}</p>
                      <p className="text-xs text-amber-600 flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </p>
                    </div>
                  </div>

                  {/* Advisors */}
                  {dept.teacherList.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Advisors</p>
                      <div className="flex flex-wrap gap-2">
                        {dept.teacherList.map((t) => {
                          const name = t.name ?? t.fullName ?? t.email;
                          return (
                            <div key={t.id} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {getInitials(name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent projects */}
                  {dept.recentProjects.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recent Projects</p>
                      <div className="space-y-1.5">
                        {dept.recentProjects.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 text-xs">
                            <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate text-muted-foreground">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
