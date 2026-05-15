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
import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import { AICheckerModal } from '@/app/(src)/components/modals/AICheckerModal';

// Mock existing data
const existingProposal = {
  title: 'AI-Powered Student Performance Analytics',
  abstract:
    'This project aims to develop an AI-powered system that analyzes student performance data to provide personalized learning recommendations. By leveraging machine learning algorithms, we will identify patterns in academic performance and engagement metrics to help educators and students make data-driven decisions.',
  objectives:
    '1. Develop a data collection pipeline for student performance metrics\n2. Build machine learning models to predict at-risk students\n3. Create a dashboard for educators to visualize insights\n4. Implement personalized recommendation engine',
  methodology:
    "We will use a combination of supervised and unsupervised learning techniques. Data will be collected from the university's LMS and anonymized. The system will be built using Python with TensorFlow for ML models and React for the frontend dashboard.",
  department: 'computer_science',
  expectedOutcomes:
    'A fully functional web application that can:\n- Predict student performance with 85%+ accuracy\n- Provide actionable insights to educators\n- Generate personalized study recommendations',
};

export default function EditProposalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showAIChecker, setShowAIChecker] = useState(false);

  const [formData, setFormData] = useState({
    title: existingProposal.title,
    abstract: existingProposal.abstract,
    objectives: existingProposal.objectives,
    methodology: existingProposal.methodology,
    department: existingProposal.department,
    expectedOutcomes: existingProposal.expectedOutcomes,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate save
    setTimeout(() => {
      toast({
        title: 'Changes Saved',
        description: 'Your proposal has been updated successfully.',
      });
      setIsLoading(false);
      router.push('/student/dashboard/proposals/1');
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
                Edit Proposal
              </h1>
              <p className="text-muted-foreground">
                Update your proposal details and resubmit for review.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => setShowAIChecker(true)}
          >
            <Sparkles className="h-4 w-4" />
            AI Check
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the core details of your project proposal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">
                  Project Title
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
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange('department', value)}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select department" />
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
                  Abstract
                </Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => handleChange('abstract', e.target.value)}
                  placeholder="Provide a brief summary of your project..."
                  className="min-h-[150px] rounded-xl resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.abstract.length}/500 characters
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
                  placeholder="List your project objectives..."
                  className="min-h-[120px] rounded-xl resize-none"
                  required
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
                  placeholder="Describe your approach and methods..."
                  className="min-h-[120px] rounded-xl resize-none"
                  required
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
                  placeholder="What do you expect to achieve?"
                  className="min-h-[120px] rounded-xl resize-none"
                  required
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
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <AICheckerModal open={showAIChecker} onOpenChange={setShowAIChecker} />
    </DashboardLayout>
  );
}
