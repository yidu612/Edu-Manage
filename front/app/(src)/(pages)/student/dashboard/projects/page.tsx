'use client';

import { useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  FolderGit2, Plus, Search, GraduationCap, Calendar, FileText,
  ArrowRight, Loader2, CheckCircle2, Clock, Send, BookOpen,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Proposal = { _id: string; title: string; status: 'pending' | 'approved' | 'rejected' | 'draft' };

type Project = {
  id: string;
  _id: string;
  title: string;
  abstract?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  mentorId?: { fullName?: string; name?: string } | null;
  proposalId?: Proposal | null;
  createdAt: string;
};

const PROJECT_STATUS: Record<string, { label: string; cls: string }> = {
  draft:        { label: 'Draft',        cls: 'bg-gray-100 text-gray-700' },
  submitted:    { label: 'Under Review', cls: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'Active',       cls: 'bg-emerald-100 text-emerald-700' },
  approved:     { label: 'Approved',     cls: 'bg-blue-100 text-blue-700' },
  rejected:     { label: 'Rejected',     cls: 'bg-red-100 text-red-700' },
};

const PROPOSAL_STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Proposal: Pending Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Proposal: Approved',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Proposal: Rejected',       cls: 'bg-red-50 text-red-700 border-red-200' },
  draft:    { label: 'Proposal: Draft',           cls: 'bg-gray-50 text-gray-600 border-gray-200' },
};

export default function StudentProjectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAbstract, setNewAbstract] = useState('');

  const { data, isLoading } = useSWR('/projects', fetcher);
  const projects: Project[] = data?.data ?? [];

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProject = async () => {
    if (!newTitle.trim()) {
      toast({ variant: 'destructive', title: 'Title required' });
      return;
    }
    setCreating(true);
    try {
      await api.post('/projects', { title: newTitle.trim(), abstract: newAbstract.trim() || undefined });
      toast({ title: 'Project created', description: 'Now submit a proposal to activate it.' });
      globalMutate('/projects');
      setShowNew(false);
      setNewTitle('');
      setNewAbstract('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create project.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-8 px-4 py-6 md:px-6 lg:px-8 w-full animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FolderGit2 className="h-8 w-8 text-emerald-600" />
              My Projects
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a project, then submit a proposal to activate it.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects…"
                className="pl-9 rounded-full w-56"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="rounded-full gap-2" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </div>
        </div>

        {/* Lifecycle hint */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
          <span className="font-semibold text-foreground">Workflow:</span>
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Create project</span>
          <ArrowRight className="h-3 w-3" />
          <span className="flex items-center gap-1"><Send className="h-3.5 w-3.5" /> Submit proposal</span>
          <ArrowRight className="h-3 w-3" />
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Admin reviews</span>
          <ArrowRight className="h-3 w-3" />
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Project activated</span>
        </div>

        {/* Project cards */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-muted/10">
            <FolderGit2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No projects yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-6">
              {projects.length === 0 ? 'Start by creating your first project.' : 'No projects match your search.'}
            </p>
            {projects.length === 0 && (
              <Button className="rounded-full gap-2" onClick={() => setShowNew(true)}>
                <Plus className="h-4 w-4" /> Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => {
              const id = project._id ?? project.id;
              const statusMeta = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.draft;
              const proposal = project.proposalId;
              const proposalMeta = proposal ? PROPOSAL_STATUS[proposal.status] : null;
              const advisorName = project.mentorId?.fullName ?? project.mentorId?.name ?? null;
              const canSubmitProposal = !proposal || proposal.status === 'rejected';
              const isActive = project.status === 'under_review' || project.status === 'approved';

              return (
                <Card
                  key={id}
                  className="flex flex-col border shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden"
                >
                  <CardHeader className="pb-3 space-y-2 bg-muted/5">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className={`text-[10px] border-0 shrink-0 ${statusMeta.cls}`}>
                        {statusMeta.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-base leading-snug line-clamp-2">{project.title}</h3>
                    {project.abstract && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{project.abstract}</p>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3 pt-3">
                    {/* Proposal status */}
                    {proposalMeta ? (
                      <div className={`flex items-center gap-2 text-xs rounded-lg border px-3 py-2 ${proposalMeta.cls}`}>
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        {proposalMeta.label}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs rounded-lg border border-dashed px-3 py-2 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        No proposal submitted yet
                      </div>
                    )}

                    {/* Advisor */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                      {advisorName
                        ? <span className="font-medium text-gray-700">{advisorName}</span>
                        : <span>No advisor assigned</span>}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 pt-0 px-5 pb-5">
                    {/* Active project — manage documentation */}
                    {isActive && (
                      <Button
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2 h-9 text-sm"
                        onClick={() => router.push(`/student/dashboard/projects/${id}/documentation`)}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Manage Documentation
                      </Button>
                    )}

                    {/* Submit / resubmit proposal */}
                    {canSubmitProposal && (
                      <Button
                        variant={isActive ? 'outline' : 'default'}
                        className="w-full rounded-xl gap-2 h-9 text-sm"
                        onClick={() => router.push(`/student/dashboard/proposals/new?projectId=${id}`)}
                      >
                        <Send className="h-4 w-4" />
                        {proposal?.status === 'rejected' ? 'Resubmit Proposal' : 'Submit Proposal'}
                      </Button>
                    )}

                    {/* View existing proposal */}
                    {proposal && proposal.status !== 'rejected' && (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl gap-2 h-9 text-sm"
                        onClick={() => router.push('/student/dashboard/proposals')}
                      >
                        <FileText className="h-4 w-4" /> View Proposal
                        <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-emerald-600" /> New Project
            </DialogTitle>
            <DialogDescription>
              Give your project a title. You will submit a proposal separately to activate it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="proj-title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="proj-title"
                placeholder="e.g. AI-based Student Performance Prediction"
                className="rounded-xl"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateProject(); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-abstract">Brief description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                id="proj-abstract"
                placeholder="One or two sentences describing what this project is about…"
                className="rounded-xl resize-none min-h-[80px]"
                value={newAbstract}
                onChange={(e) => setNewAbstract(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button className="rounded-full gap-2" onClick={handleCreateProject} disabled={creating || !newTitle.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
