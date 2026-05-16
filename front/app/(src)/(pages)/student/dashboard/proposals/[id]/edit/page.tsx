'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import { AICheckerModal } from '@/app/(src)/components/modals/AICheckerModal';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function EditProposalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showAIChecker, setShowAIChecker] = useState(false);

  const { data } = useSWR(`/proposals/${id}`, fetcher);
  const proposal = data?.data;

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    objectives: '',
    methodology: '',
    department: '',
    expectedOutcomes: '',
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        title:            proposal.title           ?? '',
        abstract:         proposal.abstract        ?? '',
        objectives:       proposal.objectives      ?? '',
        methodology:      proposal.methodology     ?? '',
        department:       proposal.department      ?? '',
        expectedOutcomes: proposal.expectedOutcomes ?? '',
      });
    }
  }, [proposal]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put(`/proposals/${id}`, formData);
      toast({ title: 'Changes Saved', description: 'Your proposal has been updated.' });
      router.push(`/student/dashboard/proposals/${id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
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
              <h1 className="text-2xl font-bold tracking-tight">Edit Proposal</h1>
              <p className="text-muted-foreground">Update your proposal details and resubmit for review.</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowAIChecker(true)}>
            <Sparkles className="h-4 w-4" />AI Check
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the core details of your project proposal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">Project Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Enter your project title" className="h-12 rounded-xl" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="font-semibold">Department</Label>
                <Select value={formData.department} onValueChange={(v) => handleChange('department', v)}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer_science">Computer Science</SelectItem>
                    <SelectItem value="software_engineering">Software Engineering</SelectItem>
                    <SelectItem value="information_technology">Information Technology</SelectItem>
                    <SelectItem value="electrical_engineering">Electrical Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract" className="font-semibold">Abstract</Label>
                <Textarea id="abstract" value={formData.abstract} onChange={(e) => handleChange('abstract', e.target.value)} placeholder="Provide a brief summary..." className="min-h-[150px] rounded-xl resize-none" />
                <p className="text-xs text-muted-foreground">{formData.abstract.length}/500 characters</p>
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
                <Textarea id="methodology" value={formData.methodology} onChange={(e) => handleChange('methodology', e.target.value)} placeholder="Describe your approach..." className="min-h-[120px] rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedOutcomes" className="font-semibold">Expected Outcomes</Label>
                <Textarea id="expectedOutcomes" value={formData.expectedOutcomes} onChange={(e) => handleChange('expectedOutcomes', e.target.value)} placeholder="What do you expect to achieve?" className="min-h-[120px] rounded-xl resize-none" />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-end pt-4">
            <Button type="button" variant="outline" className="rounded-full px-8" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="rounded-full px-8 gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <AICheckerModal open={showAIChecker} onOpenChange={setShowAIChecker} />
    </DashboardLayout>
  );
}
