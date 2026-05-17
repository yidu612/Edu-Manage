'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileText, CheckCircle, CheckCircle2, XCircle, Clock, User, Calendar, AlertCircle, Loader2,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  studentId?: { id: string; name?: string; fullName?: string; email?: string; department?: string };
  similarityScore?: number;
  similarityMatchedProject?: { id?: string; _id?: string; title?: string } | null;
  createdAt: string;
  updatedAt: string;
  objectives?: string;
  abstract?: string;
};

function getSimilarityBadge(score?: number) {
  if (score == null || score === 0) return null;
  const color = score >= 60
    ? 'bg-red-100 text-red-700 border-red-200'
    : score >= 30
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  return (
    <Badge variant="outline" className={`gap-1 text-xs ${color}`}>
      <AlertCircle className="h-3 w-3" />
      {score}% similar
    </Badge>
  );
}

function getStatusBadge(status: Project['status']) {
  if (status === 'approved') {
    return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
  }
  if (status === 'rejected') {
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
  }
  if (status === 'submitted' || status === 'under_review') {
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>;
  }
  return <Badge variant="outline" className="text-muted-foreground gap-1"><FileText className="h-3 w-3" />{status}</Badge>;
}

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function DocumentationReviewPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR('/projects', fetcher);
  const projects: Project[] = data?.data ?? [];

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingProjects = projects.filter((p) => p.status === 'submitted' || p.status === 'under_review');
  const reviewedProjects = projects.filter((p) => p.status === 'approved' || p.status === 'rejected');

  const handleReviewClick = (project: Project, action: 'approve' | 'reject') => {
    setSelectedProject(project);
    setReviewAction(action);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!selectedProject || !reviewAction) return;
    if (reviewAction === 'reject' && !reviewComment.trim()) {
      toast({ title: 'Comment Required', description: 'Please provide a reason for rejection.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const status = reviewAction === 'approve' ? 'approved' : 'rejected';
      await api.put(`/projects/${selectedProject.id}/status`, { status });
      await mutate();
      toast({
        title: reviewAction === 'approve' ? 'Project Approved' : 'Project Rejected',
        description: `"${selectedProject.title}" has been ${reviewAction}d.`,
      });
      setSelectedProject(null);
      setReviewAction(null);
      setReviewComment('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const studentName = project.studentId?.fullName ?? project.studentId?.name ?? '—';
    const isPending = project.status === 'submitted' || project.status === 'under_review';

    return (
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {project.studentId?.department ?? 'Research Project'}
                </CardDescription>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              {getStatusBadge(project.status)}
              {getSimilarityBadge(project.similarityScore)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          {project.abstract && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.abstract}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{getInitials(studentName)}</AvatarFallback>
              </Avatar>
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{studentName}</span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex-1" />

          {isPending && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button
                variant="outline"
                className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                onClick={() => handleReviewClick(project, 'approve')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />Approve
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleReviewClick(project, 'reject')}
              >
                <XCircle className="mr-2 h-4 w-4" />Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Review</h1>
          <p className="text-muted-foreground">Review and approve student projects assigned to you.</p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending Review
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">{pendingProjects.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Approved
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">{projects.filter((p) => p.status === 'approved').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-red-50/50 border-red-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Rejected
              </CardDescription>
              <CardTitle className="text-3xl text-red-900">{projects.filter((p) => p.status === 'rejected').length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
              <TabsTrigger value="pending">Pending ({pendingProjects.length})</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed ({reviewedProjects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingProjects.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold">All Caught Up!</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto">No projects pending your review at this time.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {pendingProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviewed" className="mt-6">
              {reviewedProjects.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No reviewed projects yet.</h3>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {reviewedProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={!!selectedProject} onOpenChange={(o) => { if (!o) { setSelectedProject(null); setReviewAction(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'approve'
                ? <CheckCircle className="h-5 w-5 text-emerald-600" />
                : <XCircle className="h-5 w-5 text-red-600" />}
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Project
            </DialogTitle>
            <DialogDescription>
              {selectedProject && (
                <span className="block mt-1">
                  <span className="font-semibold text-foreground">{selectedProject.title}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {reviewAction === 'reject' ? 'Reason for Rejection (Required)' : 'Comments (Optional)'}
              </label>
              <Textarea
                placeholder={reviewAction === 'reject' ? 'Please explain what changes are needed...' : 'Add any feedback for the student...'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="resize-none min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setSelectedProject(null); setReviewAction(null); }}>Cancel</Button>
            <Button
              className={reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-destructive hover:bg-destructive/90'}
              onClick={handleSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm {reviewAction === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
