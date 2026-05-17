'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Loader2, Sparkles, Save, Paperclip, Tag, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/app/(src)/hooks/use-toast';
import { AICheckerModal } from '@/app/(src)/components/modals/AICheckerModal';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function NewProposalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showAIChecker, setShowAIChecker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const { data: teachersData } = useSWR('/users/teachers', fetcher);
  const { data: categoriesData } = useSWR('/admin/categories', fetcher);
  const teachers: Array<{ id: string; name: string; department: string }> = teachersData?.data ?? [];
  const categories: string[] = categoriesData?.data ?? [];

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    objectives: '',
    methodology: '',
    department: '',
    expectedOutcomes: '',
    teacherId: '',
    category: '',
    keywords: '',
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordList, setKeywordList] = useState<string[]>([]);
  const [similarityWarning, setSimilarityWarning] = useState<{ score: number; matchedTitle: string } | null>(null);
  const [forceSubmit, setForceSubmit] = useState(false);

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywordList.includes(kw) && keywordList.length < 10) {
      setKeywordList((prev) => [...prev, kw]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => setKeywordList((prev) => prev.filter((k) => k !== kw));

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildFormData = (status?: string) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (status) fd.set('status', status);
    keywordList.forEach((kw) => fd.append('keywords', kw));
    return fd;
  };

  const handleSaveDraft = async () => {
    if (!formData.title) {
      toast({ variant: 'destructive', title: 'Title required', description: 'Please enter a title to save draft.' });
      return;
    }
    try {
      await api.post('/proposals/submit', buildFormData('draft'), { headers: { 'Content-Type': 'multipart/form-data' } });
      toast({ title: 'Draft Saved', description: 'Your proposal draft has been saved.' });
      router.push('/student/dashboard/proposals');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save draft.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.abstract || !formData.department) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Title, abstract, and department are required.' });
      return;
    }

    setIsLoading(true);
    try {
      const fd = buildFormData();
      if (forceSubmit) fd.append('force', 'true');
      if (fileRef.current?.files?.[0]) fd.append('proposalFile', fileRef.current.files[0]);

      await api.post('/proposals/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast({ title: 'Proposal Submitted', description: 'Your proposal has been submitted for review.' });
      router.push('/student/dashboard/proposals');
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { message?: string; similarityScore?: number; matchedTitle?: string; status?: number } } })?.response;
      if (errData?.data?.similarityScore !== undefined) {
        // 409 — duplicate warning
        setSimilarityWarning({ score: errData.data.similarityScore!, matchedTitle: errData.data.matchedTitle ?? 'another proposal' });
      } else {
        const msg = errData?.data?.message ?? 'Submission failed.';
        toast({ variant: 'destructive', title: 'Error', description: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">New Proposal</h1>
              <p className="text-muted-foreground">Create a new project proposal for review.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowAIChecker(true)}>
              <Sparkles className="h-4 w-4" />AI Check
            </Button>
            <Button variant="outline" className="rounded-full gap-2" onClick={handleSaveDraft}>
              <Save className="h-4 w-4" />Save Draft
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the core details of your project proposal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">Project Title <span className="text-destructive">*</span></Label>
                <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Enter your project title" className="h-12 rounded-xl" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="font-semibold">Department <span className="text-destructive">*</span></Label>
                <Select value={formData.department} onValueChange={(v) => handleChange('department', v)}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select your department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer_science">Computer Science</SelectItem>
                    <SelectItem value="software_engineering">Software Engineering</SelectItem>
                    <SelectItem value="information_technology">Information Technology</SelectItem>
                    <SelectItem value="electrical_engineering">Electrical Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold">Category <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Keywords <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a keyword…"
                      className="h-12 rounded-xl"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                    />
                    <Button type="button" variant="outline" className="h-12 px-3 rounded-xl" onClick={addKeyword}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {keywordList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {keywordList.map((kw) => (
                        <Badge
                          key={kw}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive/10 hover:text-destructive text-xs"
                          onClick={() => removeKeyword(kw)}
                        >
                          {kw} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract" className="font-semibold">Abstract <span className="text-destructive">*</span></Label>
                <Textarea id="abstract" value={formData.abstract} onChange={(e) => handleChange('abstract', e.target.value)} placeholder="Brief summary of your project..." className="min-h-[150px] rounded-xl resize-none" required />
                <p className="text-xs text-muted-foreground">{formData.abstract.length}/500 characters recommended</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher" className="font-semibold">Preferred Supervisor <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select value={formData.teacherId} onValueChange={(v) => handleChange('teacherId', v)}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select a supervisor (optional)" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} — {t.department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Describe your objectives, methodology, and expected outcomes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="objectives" className="font-semibold">Objectives</Label>
                <Textarea id="objectives" value={formData.objectives} onChange={(e) => handleChange('objectives', e.target.value)} placeholder="List your project objectives..." className="min-h-[120px] rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="methodology" className="font-semibold">Methodology</Label>
                <Textarea id="methodology" value={formData.methodology} onChange={(e) => handleChange('methodology', e.target.value)} placeholder="Describe your approach and methods..." className="min-h-[120px] rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedOutcomes" className="font-semibold">Expected Outcomes</Label>
                <Textarea id="expectedOutcomes" value={formData.expectedOutcomes} onChange={(e) => handleChange('expectedOutcomes', e.target.value)} placeholder="What deliverables do you expect?" className="min-h-[120px] rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Proposal Document <span className="text-muted-foreground text-xs">(optional — PDF, DOC)</span></Label>
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{fileName || 'Click to attach a document'}</p>
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
              </div>
            </CardContent>
          </Card>

          {similarityWarning && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">Similarity Warning — {similarityWarning.score}% match</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your abstract is similar to an existing proposal: <span className="font-medium">"{similarityWarning.matchedTitle}"</span>.
                    Please revise your abstract or confirm you understand the overlap.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceSubmit}
                  onChange={(e) => setForceSubmit(e.target.checked)}
                  className="rounded border-amber-400"
                />
                I acknowledge the similarity and want to submit anyway
              </label>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-end pt-4">
            <Button type="button" variant="outline" className="rounded-full px-8" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="rounded-full px-8 gap-2" disabled={isLoading || (!!similarityWarning && !forceSubmit)}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Proposal
            </Button>
          </div>
        </form>
      </div>

      <AICheckerModal open={showAIChecker} onOpenChange={setShowAIChecker} />
    </DashboardLayout>
  );
}
