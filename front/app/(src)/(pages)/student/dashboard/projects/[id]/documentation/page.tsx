"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Presentation,
  Link as LinkIcon,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Lock,
  UserCheck,
  Users,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function DocumentationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // 1. Fetch Project Details (Includes Proposal, Versions, Team, and Approver)
  const { data: project } = useSWR(`/projects/${projectId}`, fetcher);
  
  // 2. Fetch Documentation List
  const { data: documents = [], isLoading } = useSWR(
    `/projects/${projectId}/documentation`,
    fetcher
  );

  const [isUploading, setIsUploading] = useState(false);

  // Derived Data for Header
  const projectTitle = project?.proposal?.versions?.[0]?.title || "Project Overview";
  const teamName = project?.team?.name || "Loading Team...";
  const approverName = project?.approver?.name || "Faculty Advisor";
  const approvalDate = project?.created_at ? new Date(project.created_at).toLocaleDateString() : "...";

  // Compute progress
  const progressStats = useMemo(() => {
    const requiredTypes = ["final_report", "presentation", "code_link"];
    const uploaded = documents.filter((d: any) => d.status === "approved" || d.status === "pending");
    const completedCount = requiredTypes.filter((type) =>
      uploaded.some((u: any) => u.document_type === type)
    ).length;

    return {
      percentage: Math.round((completedCount / requiredTypes.length) * 100),
      items: requiredTypes.map((type) => ({
        type,
        label: type === "final_report" ? "Final Report" : type === "presentation" ? "Presentation" : "Code Repository",
        completed: uploaded.some((d: any) => d.document_type === type),
      })),
    };
  }, [documents]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", type);

    setIsUploading(true);
    try {
      await api.post(`/projects/${projectId}/documentation`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("File uploaded successfully");
      mutate(`/projects/${projectId}/documentation`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkSubmit = async (type: string, url: string) => {
    if (!url.trim()) return;
    try {
      await api.post(`/projects/${projectId}/documentation`, { document_type: type, url: url });
      toast.success("Link saved successfully");
      mutate(`/projects/${projectId}/documentation`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save link");
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Are you sure? This will permanently delete the item.")) return;
    try {
      await api.delete(`/documentation/${docId}`);
      toast.success("Item removed");
      mutate(`/projects/${projectId}/documentation`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/student/dashboard/projects")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{projectTitle}</h1>
            <div className="flex items-center gap-2 text-primary font-medium mt-1">
                <Users className="h-4 w-4" />
                <span>Team: {teamName}</span>
            </div>
          </div>
        </div>

        {/* Project Info Banner */}
        <Card className="border-emerald-200 bg-emerald-50/30 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-emerald-100">
                   <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Approved By</p>
                    <h3 className="font-bold text-gray-900">{approverName}</h3>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Approval Date</p>
                <p className="font-bold text-gray-900">{approvalDate}</p>
              </div>
              <Badge className="bg-emerald-600 text-white border-0 px-4 h-8">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                ACTIVE PROJECT
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation Progress</CardTitle>
            <CardDescription>
              Complete all required documentation to finalize your project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>{progressStats.items.filter(i => i.completed).length} of {progressStats.items.length} documents uploaded</span>
              <span className="font-medium">{progressStats.percentage}%</span>
            </div>
            <Progress value={progressStats.percentage} className="h-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {progressStats.items.map((item) => (
                <div key={item.type} className="flex items-center gap-2 text-sm">
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        <div className="grid gap-6 lg:grid-cols-2">
          {/* File Upload Section */}
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-lg">Files</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <DocUploadSlot title="Final Report (PDF)" type="final_report" doc={documents.find((d: any) => d.document_type === "final_report")} onUpload={handleFileUpload} onDelete={handleDelete} loading={isUploading} icon={<FileText className="h-8 w-8 text-red-500" />} />
              <DocUploadSlot title="Presentation (PPTX)" type="presentation" doc={documents.find((d: any) => d.document_type === "presentation")} onUpload={handleFileUpload} onDelete={handleDelete} loading={isUploading} icon={<Presentation className="h-8 w-8 text-orange-500" />} />
            </CardContent>
          </Card>

          {/* Links Section */}
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-lg">External Links</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <LinkInputSlot label="Code Repository" type="code_link" placeholder="https://github.com/..." doc={documents.find((d: any) => d.document_type === "code_link")} onSave={handleLinkSubmit} onDelete={handleDelete} />
              <LinkInputSlot label="Live Demo (Optional)" type="deployed_link" placeholder="https://demo.com" doc={documents.find((d: any) => d.document_type === "deployed_link")} onSave={handleLinkSubmit} onDelete={handleDelete} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ==================== SUB COMPONENTS ====================

function DocUploadSlot({ title, type, doc, onUpload, onDelete, loading, icon }: any) {
  return (
    <div className="p-4 border rounded-2xl space-y-3 bg-muted/5">
      <div className="flex justify-between items-center">
        <Label className="font-bold text-sm text-gray-700">{title}</Label>
        {doc && <Badge className={doc.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}>{doc.status.toUpperCase()}</Badge>}
      </div>

      {doc ? (
        <div className="flex items-center justify-between p-3 border bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            {icon}
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{doc.url.split("/").pop()}</span>
                <span className="text-[10px] text-muted-foreground">Uploaded {new Date(doc.submitted_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="rounded-full" asChild>
              <a href={`http://localhost:8080/${doc.url}`} target="_blank"><Download className="h-4 w-4" /></a>
            </Button>
            {doc.status === "pending" && <Button size="icon" variant="ghost" className="text-red-500 rounded-full" onClick={() => onDelete(doc.id)}><Trash2 className="h-4 w-4" /></Button>}
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 cursor-pointer hover:bg-muted/50 transition-all border-muted-foreground/20">
          <input type="file" className="hidden" onChange={(e) => onUpload(e, type)} disabled={loading} accept={type === "final_report" ? ".pdf" : ".ppt,.pptx"} />
          {loading ? <Loader2 className="animate-spin h-6 w-6 text-primary" /> : <><Upload className="h-6 w-6 text-muted-foreground mb-2" /><span className="text-xs font-medium text-muted-foreground">Upload file</span></>}
        </label>
      )}
    </div>
  );
}

function LinkInputSlot({ label, type, placeholder, doc, onSave, onDelete }: any) {
  const [inputValue, setInputValue] = useState("");
  useEffect(() => { setInputValue(doc?.url || ""); }, [doc]);

  return (
    <div className="space-y-2 p-4 border rounded-2xl bg-muted/5">
      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          {doc ? <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" /> : <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={placeholder} disabled={!!doc} className="pl-10 h-11 rounded-xl bg-white" />
        </div>
        {!doc ? (
          <Button size="icon" className="h-11 w-11 rounded-xl shadow-md shadow-primary/10" onClick={() => onSave(type, inputValue)} disabled={!inputValue.startsWith("http")}><Upload className="h-4 w-4" /></Button>
        ) : doc.status === "pending" && (
          <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl text-red-500 border-red-100" onClick={() => onDelete(doc.id)}><Trash2 className="h-4 w-4" /></Button>
        )}
        {doc && (
          <Button size="icon" variant="secondary" className="h-11 w-11 rounded-xl" asChild>
            <a href={doc.url} target="_blank"><ExternalLink className="h-4 w-4" /></a>
          </Button>
        )}
      </div>
    </div>
  );
}