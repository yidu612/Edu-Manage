'use client';

import { useState, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  FileText,
  FileCode,
  Presentation,
  Link as LinkIcon,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

type Doc = {
  id: string;
  documentType: string;
  name: string;
  url: string;
  size: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

const docTypeIcon = (type: string) => {
  if (type === 'presentation') return <Presentation className="h-8 w-8 text-orange-500" />;
  if (type === 'code' || type === 'code_link') return <FileCode className="h-8 w-8 text-blue-500" />;
  if (type === 'demo_link') return <ExternalLink className="h-8 w-8 text-purple-500" />;
  return <FileText className="h-8 w-8 text-red-500" />;
};

const guessDocType = (file: File): string => {
  if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx') || file.type.includes('presentation')) return 'presentation';
  if (file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) return 'report';
  return 'other';
};

const formatSize = (bytes: number) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function DocumentationPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [codeLink, setCodeLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch student's projects
  const { data: projectsData, isLoading: loadingProjects } = useSWR('/projects', fetcher);
  const projects: Project[] = projectsData?.data ?? [];
  const project = projects.find((p) => p.status !== 'draft') ?? projects[0];

  // Fetch documentation for the active project
  const docsKey = project ? `/projects/${project.id}/documentation` : null;
  const { data: docsData, isLoading: loadingDocs } = useSWR(docsKey, fetcher);
  const docs: Doc[] = docsData?.data ?? [];

  // Sync link fields from fetched docs
  const codeLinkDoc = docs.find((d) => d.documentType === 'code_link');
  const demoLinkDoc = docs.find((d) => d.documentType === 'demo_link');
  const fileDocs = docs.filter((d) => d.documentType !== 'code_link' && d.documentType !== 'demo_link');

  const handleUpload = async (files: FileList | null) => {
    if (!files || !project) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('documentType', guessDocType(file));
        fd.append('name', file.name);
        await api.post(`/projects/${project.id}/documentation`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      mutate(docsKey);
      toast({ title: 'Uploaded', description: 'Document(s) uploaded successfully.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Upload failed.';
      toast({ variant: 'destructive', title: 'Upload Error', description: msg });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string) => {
    if (!project) return;
    setDeletingId(docId);
    try {
      await api.delete(`/projects/${project.id}/documentation/${docId}`);
      mutate(docsKey);
      toast({ title: 'Deleted', description: 'Document removed.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete document.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveLinks = async () => {
    if (!project) return;
    setIsSavingLinks(true);
    try {
      await api.put(`/projects/${project.id}/links`, { codeLink, demoLink });
      mutate(docsKey);
      toast({ title: 'Links Saved', description: 'Repository and demo links updated.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save links.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsSavingLinks(false);
    }
  };

  // Pre-fill link inputs when docs load
  if (codeLinkDoc && !codeLink) setCodeLink(codeLinkDoc.url);
  if (demoLinkDoc && !demoLink) setDemoLink(demoLinkDoc.url);

  if (loadingProjects) {
    return (
      <DashboardLayout role="student">
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Project Documentation</h1>
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No project found.</p>
              <p className="text-sm mt-1">You need an active project before uploading documentation.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Documentation</h1>
          <p className="text-muted-foreground">
            Upload documents and link your code repository for your project
          </p>
        </div>

        {/* Project Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={
                  project.status === 'approved'
                    ? 'gap-1 bg-green-500/10 text-green-700 border-0'
                    : 'gap-1'
                }
              >
                {project.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload your final report, presentation, and other project files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => handleUpload(e.target.files)}
              />

              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
                onDragOver={(e) => e.preventDefault()}
              >
                {isUploading ? (
                  <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-2" />
                ) : (
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                )}
                <p className="text-sm text-muted-foreground mb-2">
                  {isUploading ? 'Uploading...' : 'Drag and drop files here, or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground">Supported: PDF, DOCX, PPTX</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  disabled={isUploading}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Select Files
                </Button>
              </div>

              {/* Uploaded Files */}
              {loadingDocs ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : fileDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {fileDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        {docTypeIcon(doc.documentType)}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className={
                            doc.status === 'approved'
                              ? 'bg-green-500/10 text-green-700 border-0'
                              : doc.status === 'rejected'
                              ? 'bg-red-500/10 text-red-700 border-0'
                              : ''
                          }
                        >
                          {doc.status}
                        </Badge>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                        >
                          {deletingId === doc.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle>External Links</CardTitle>
              <CardDescription>Link your code repository and live demo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="codeLink">Code Repository</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="codeLink"
                      placeholder="https://github.com/username/project"
                      value={codeLink}
                      onChange={(e) => setCodeLink(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {codeLink && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={codeLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                {codeLinkDoc && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Repository saved
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoLink">Live Demo (Optional)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="demoLink"
                      placeholder="https://your-project-demo.com"
                      value={demoLink}
                      onChange={(e) => setDemoLink(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {demoLink && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={demoLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSaveLinks}
                disabled={isSavingLinks}
                className="w-full gap-2"
              >
                {isSavingLinks ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                Save Links
              </Button>

              <div className="pt-2 border-t">
                <h4 className="font-medium text-sm mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                      <FileCode className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href="https://gitlab.com" target="_blank" rel="noopener noreferrer">
                      <FileCode className="h-4 w-4" />
                      GitLab
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
