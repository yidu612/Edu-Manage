'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react';

interface AICheckerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CheckResult {
  category: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  score: number;
}

export function AICheckerModal({ open, onOpenChange }: AICheckerModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CheckResult[] | null>(null);

  const mockResults: CheckResult[] = [
    {
      category: 'Originality',
      status: 'pass',
      message: 'Content appears to be original with no detected plagiarism.',
      score: 95,
    },
    {
      category: 'AI Content Detection',
      status: 'warning',
      message:
        'Some sections may contain AI-generated content. Consider rephrasing.',
      score: 72,
    },
    {
      category: 'Grammar & Clarity',
      status: 'pass',
      message: 'Well-written with clear structure and minimal errors.',
      score: 88,
    },
    {
      category: 'Technical Depth',
      status: 'pass',
      message: 'Good technical detail and methodology explanation.',
      score: 85,
    },
    {
      category: 'References',
      status: 'warning',
      message: 'Consider adding more recent academic sources.',
      score: 65,
    },
  ];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setProgress(0);
    setResults(null);

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setResults(mockResults);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-100 text-amber-700 border-amber-200',
      fail: 'bg-red-100 text-red-700 border-red-200',
    };
    return variants[status as keyof typeof variants] || '';
  };

  const overallScore = results
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            AI Content Checker
          </DialogTitle>
          <DialogDescription className="text-base">
            Analyze your proposal for originality, AI-generated content, and
            quality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isAnalyzing && !results && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ready to Analyze</h3>
                <p className="text-muted-foreground text-sm">
                  Click the button below to start the AI analysis of your
                  proposal content.
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                className="rounded-full px-8 h-12 gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Start Analysis
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8 space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Analyzing Content...</h3>
                <p className="text-muted-foreground text-sm">
                  Please wait while we analyze your proposal.
                </p>
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {overallScore}%
                </div>
                <p className="text-muted-foreground font-medium">
                  Overall Quality Score
                </p>
              </div>

              {/* Individual Results */}
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{result.category}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusBadge(result.status)}`}
                        >
                          {result.score}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => {
                    setResults(null);
                    setProgress(0);
                  }}
                >
                  Run Again
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
