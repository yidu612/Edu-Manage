'use client';

import { useState, useMemo } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Search, Filter, CheckCircle, Clock, BookOpen, GraduationCap, Link2, Building2, FileText, Calendar, Globe, Lock, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  _id?: string;
  title: string;
  status: string;
  studentId?: { id: string; name?: string; department?: string };
  mentorId?: { id: string; name?: string } | null;
  repositoryId?: { visibility?: 'public' | 'private' } | null;
  createdAt: string;
};

type Teacher = { id: string; name: string; email: string; department?: string };

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const statusColors: Record<string, string> = {
  draft:        'bg-gray-100 text-gray-700 border-gray-200',
  submitted:    'bg-amber-100 text-amber-700 border-amber-200',
  under_review: 'bg-blue-100 text-blue-700 border-blue-200',
  approved:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected:     'bg-red-100 text-red-700 border-red-200',
};

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const { data: projectsData, isLoading: loadingProjects } = useSWR('/projects', fetcher);
  const { data: teachersData } = useSWR('/users/teachers', fetcher);

  const projects: Project[] = projectsData?.data ?? [];
  const teachers: Teacher[] = teachersData?.data ?? [];

  const stats = useMemo(() => ({
    total: projects.length,
    unassigned: projects.filter((p) => !p.mentorId).length,
    assigned: projects.filter((p) => !!p.mentorId).length,
    approved: projects.filter((p) => p.status === 'approved').length,
  }), [projects]);

  const filtered = useMemo(() => projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.studentId?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [projects, searchQuery, statusFilter]);

  const togglePublish = async (project: Project) => {
    const id = project._id ?? project.id;
    const isPublic = project.repositoryId?.visibility === 'public';
    setPublishingId(id);
    try {
      await api.patch(`/admin/projects/${id}/${isPublic ? 'unpublish' : 'publish'}`);
      globalMutate('/projects');
      toast({ title: isPublic ? 'Project unpublished' : 'Project published', description: isPublic ? 'Removed from public showcase.' : 'Now visible on the public showcase.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setPublishingId(null);
    }
  };

  const confirmAssignment = async () => {
    if (!selectedProject || !selectedMentorId) return;
    setIsSubmitting(true);
    try {
      await api.post('/admin/assign-mentor', { projectId: selectedProject.id, mentorId: selectedMentorId });
      toast({ title: 'Mentor Assigned', description: `Mentor assigned to "${selectedProject.title}".` });
      globalMutate('/projects');
      setShowAssignDialog(false);
      setSelectedProject(null);
      setSelectedMentorId('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Assignment failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><UserPlus className="h-6 w-6 text-primary" /></div>
              Project Assignments
            </h1>
            <p className="text-muted-foreground mt-1">Assign faculty mentors to student projects</p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <Building2 className="h-4 w-4" />All Departments
          </Badge>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-amber-50/50 border-amber-100"><CardHeader className="pb-2"><CardDescription className="text-amber-700 font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Unassigned</CardDescription><CardTitle className="text-3xl text-amber-900">{stats.unassigned}</CardTitle></CardHeader></Card>
          <Card className="bg-blue-50/50 border-blue-100"><CardHeader className="pb-2"><CardDescription className="text-blue-700 font-medium flex items-center gap-2"><Eye className="h-4 w-4" /> Assigned</CardDescription><CardTitle className="text-3xl text-blue-900">{stats.assigned}</CardTitle></CardHeader></Card>
          <Card className="bg-emerald-50/50 border-emerald-100"><CardHeader className="pb-2"><CardDescription className="text-emerald-700 font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Approved</CardDescription><CardTitle className="text-3xl text-emerald-900">{stats.approved}</CardTitle></CardHeader></Card>
          <Card className="bg-purple-50/50 border-purple-100"><CardHeader className="pb-2"><CardDescription className="text-purple-700 font-medium flex items-center gap-2"><BookOpen className="h-4 w-4" /> Total</CardDescription><CardTitle className="text-3xl text-purple-900">{stats.total}</CardTitle></CardHeader></Card>
        </div>

        {teachers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Available Mentors</CardTitle>
              <CardDescription>Faculty members who can be assigned as project mentors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {teachers.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(t.name)}</AvatarFallback></Avatar>
                    <div><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.department ?? t.email}</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Student Projects</CardTitle>
                <CardDescription>Review and assign mentors to student projects</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search projects..." className="pl-10 rounded-full w-full sm:w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] rounded-full">
                    <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {projects.length === 0 ? "No projects yet." : "No projects match your search."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">Project</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((project) => (
                      <TableRow key={project.id} className="hover:bg-muted/50">
                        <TableCell><p className="font-medium line-clamp-1">{project.title}</p></TableCell>
                        <TableCell>
                          {project.studentId?.name ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(project.studentId.name)}</AvatarFallback></Avatar>
                              <div>
                                <p className="text-sm">{project.studentId.name}</p>
                                {project.studentId.department && <p className="text-xs text-muted-foreground">{project.studentId.department}</p>}
                              </div>
                            </div>
                          ) : <span className="text-muted-foreground text-sm">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`gap-1 ${statusColors[project.status] ?? statusColors.draft}`}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.mentorId?.name ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6"><AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">{getInitials(project.mentorId.name)}</AvatarFallback></Avatar>
                              <span className="text-sm">{project.mentorId.name}</span>
                            </div>
                          ) : <span className="text-muted-foreground text-sm">Not assigned</span>}
                        </TableCell>
                        <TableCell>
                          {project.status === 'approved' ? (
                            <Badge
                              variant="outline"
                              className={project.repositoryId?.visibility === 'public'
                                ? 'gap-1 bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'gap-1 bg-gray-50 text-gray-500 border-gray-200'}
                            >
                              {project.repositoryId?.visibility === 'public'
                                ? <><Globe className="h-3 w-3" /> Public</>
                                : <><Lock className="h-3 w-3" /> Private</>}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />{new Date(project.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {project.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className={`rounded-full gap-1 h-8 ${project.repositoryId?.visibility === 'public' ? 'text-gray-600 hover:text-red-600' : 'text-emerald-600 hover:text-emerald-700'}`}
                                onClick={() => togglePublish(project)}
                                disabled={publishingId === (project._id ?? project.id)}
                              >
                                {publishingId === (project._id ?? project.id)
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : project.repositoryId?.visibility === 'public'
                                    ? <><Lock className="h-3 w-3" /> Unpublish</>
                                    : <><Globe className="h-3 w-3" /> Publish</>}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="rounded-full gap-1 h-8"
                              onClick={() => { setSelectedProject(project); setSelectedMentorId(''); setShowAssignDialog(true); }}
                            >
                              <Link2 className="h-3 w-3" />
                              {project.mentorId ? 'Reassign' : 'Assign'}
                            </Button>
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

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Assign Mentor</DialogTitle>
            <DialogDescription>Select a faculty mentor for this project.</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="font-semibold">{selectedProject.title}</p>
                {selectedProject.studentId?.name && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" /> {selectedProject.studentId.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Mentor</label>
                <Select value={selectedMentorId} onValueChange={setSelectedMentorId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose a mentor..." /></SelectTrigger>
                  <SelectContent>
                    {teachers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No teachers available.</div>
                    ) : (
                      teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <span>{t.name}</span>
                            {t.department && <span className="text-xs text-muted-foreground">— {t.department}</span>}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedMentorId && (() => {
                const mentor = teachers.find((t) => t.id === selectedMentorId);
                if (!mentor) return null;
                return (
                  <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{getInitials(mentor.name)}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{mentor.name}</p>
                      <p className="text-sm text-muted-foreground">{mentor.email}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button className="rounded-full" onClick={confirmAssignment} disabled={!selectedMentorId || isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
