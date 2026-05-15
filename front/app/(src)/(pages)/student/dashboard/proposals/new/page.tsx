'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Send, Loader2, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import { AICheckerModal } from '@/app/(src)/components/modals/AICheckerModal';

export default function NewProposalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showAIChecker, setShowAIChecker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    objectives: '',
    methodology: '',
    department: '',
    expectedOutcomes: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    toast({
      title: 'Draft Saved',
      description: 'Your proposal draft has been saved.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.abstract || !formData.department) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setIsLoading(true);

    // Simulate submission
    setTimeout(() => {
      toast({
        title: 'Proposal Submitted',
        description: 'Your proposal has been submitted for review.',
      });
      setIsLoading(false);
      router.push('/student/dashboard/proposals');
    }, 1500);
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                New Proposal
              </h1>
              <p className="text-muted-foreground">
                Create a new project proposal for review.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => setShowAIChecker(true)}
            >
              <Sparkles className="h-4 w-4" />
              AI Check
            </Button>
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={handleSaveDraft}
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the core details of your project proposal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">
                  Project Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter your project title"
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="font-semibold">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange('department', value)}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer_science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="software_engineering">
                      Software Engineering
                    </SelectItem>
                    <SelectItem value="information_technology">
                      Information Technology
                    </SelectItem>
                    <SelectItem value="electrical_engineering">
                      Electrical Engineering
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract" className="font-semibold">
                  Abstract <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => handleChange('abstract', e.target.value)}
                  placeholder="Provide a brief summary of your project (what problem does it solve, how will you solve it?)..."
                  className="min-h-[150px] rounded-xl resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.abstract.length}/500 characters recommended
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Describe your objectives, methodology, and expected outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="objectives" className="font-semibold">
                  Objectives
                </Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleChange('objectives', e.target.value)}
                  placeholder="List your project objectives (one per line)...&#10;1. First objective&#10;2. Second objective"
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodology" className="font-semibold">
                  Methodology
                </Label>
                <Textarea
                  id="methodology"
                  value={formData.methodology}
                  onChange={(e) => handleChange('methodology', e.target.value)}
                  placeholder="Describe your approach, tools, and methods you will use..."
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedOutcomes" className="font-semibold">
                  Expected Outcomes
                </Label>
                <Textarea
                  id="expectedOutcomes"
                  value={formData.expectedOutcomes}
                  onChange={(e) =>
                    handleChange('expectedOutcomes', e.target.value)
                  }
                  placeholder="What deliverables or results do you expect to achieve?"
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-8"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full px-8 gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Proposal
            </Button>
          </div>
        </form>
      </div>

      <AICheckerModal open={showAIChecker} onOpenChange={setShowAIChecker} />
    </DashboardLayout>
  );
}
