"use client";

import { useState, useRef } from "react";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
    ExternalLink
} from "lucide-react";

const initialDocuments = [
    {
        id: "1",
        name: "Final_Report_v2.pdf",
        type: "report",
        size: "2.4 MB",
        uploadedAt: "2024-01-15",
        status: "approved",
        fileObj: null as File | null,
    },
    {
        id: "2",
        name: "Presentation_Final.pptx",
        type: "presentation",
        size: "8.1 MB",
        uploadedAt: "2024-01-14",
        status: "pending",
        fileObj: null as File | null,
    },
];

export default function Documentation() {
    const [codeLink, setCodeLink] = useState("https://github.com/university/project-analytics");
    const [demoLink, setDemoLink] = useState("");
    const [documents, setDocuments] = useState(initialDocuments);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [chapters, setChapters] = useState([
        { id: 1, label: "Chapter 1", title: "Introduction",              deadline: "2024-02-10", submitted: true  },
        { id: 2, label: "Chapter 2", title: "Literature Review",         deadline: "2024-02-28", submitted: true  },
        { id: 3, label: "Chapter 3", title: "Methodology",               deadline: "2024-03-20", submitted: false },
        { id: 4, label: "Chapter 4", title: "Results & Analysis",        deadline: "2024-04-10", submitted: false },
        { id: 5, label: "Chapter 5", title: "Discussion",                deadline: "2024-04-30", submitted: false },
        { id: 6, label: "Chapter 6", title: "Conclusion & References",   deadline: "2024-05-20", submitted: false },
    ]);

    const getDocIcon = (type: string) => {
        switch (type) {
            case "report":
                return <FileText className="h-8 w-8 text-red-500" />;
            case "presentation":
                return <Presentation className="h-8 w-8 text-orange-500" />;
            case "code":
                return <FileCode className="h-8 w-8 text-blue-500" />;
            default:
                return <FileText className="h-8 w-8 text-gray-500" />;
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const guessType = (file: File) => {
        if (file.type.includes("pdf") || file.name.endsWith(".pdf") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) return "report";
        if (file.name.endsWith(".ppt") || file.name.endsWith(".pptx") || file.type.includes("presentation")) return "presentation";
        return "code";
    };

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const newDocs = Array.from(files).map((file, i) => ({
            id: Date.now().toString() + i,
            name: file.name,
            type: guessType(file),
            size: formatSize(file.size),
            uploadedAt: new Date().toISOString().split("T")[0],
            status: "pending",
            fileObj: file,
        }));
        setDocuments(prev => [...prev, ...newDocs]);
        // reset input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDelete = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const handleDownload = (doc: typeof documents[0]) => {
        if (!doc.fileObj) return;
        const url = URL.createObjectURL(doc.fileObj);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Project Documentation</h1>
                    <p className="text-muted-foreground">
                        Upload your final project documents and link your code repository
                    </p>
                </div>

                {/* Project Info */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">AI-Powered Student Performance Analytics</h3>
                                <p className="text-sm text-muted-foreground">
                                    Approved on January 10, 2024
                                </p>
                            </div>
                            <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 shadow-none border-0">
                                <CheckCircle2 className="h-3 w-3" />
                                Approved
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Documentation Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Documentation Progress</CardTitle>
                        <CardDescription>
                            Track your chapter submissions — {chapters.filter(c => c.submitted).length} of {chapters.length} chapters submitted
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span>{chapters.filter(c => c.submitted).length} of {chapters.length} chapters submitted</span>
                            <span className="font-medium">{Math.round((chapters.filter(c => c.submitted).length / chapters.length) * 100)}%</span>
                        </div>
                        <Progress value={Math.round((chapters.filter(c => c.submitted).length / chapters.length) * 100)} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                            {chapters.map((ch) => {
                                const isOverdue = !ch.submitted && new Date() > new Date(ch.deadline);
                                const daysLeft = Math.ceil((new Date(ch.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div
                                        key={ch.id}
                                        className={`flex items-start justify-between p-3 rounded-lg border ${
                                            ch.submitted
                                                ? "bg-green-50/60 border-green-200"
                                                : isOverdue
                                                ? "bg-red-50/60 border-red-200"
                                                : "bg-muted/30 border-muted"
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {ch.submitted
                                                ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                : isOverdue
                                                ? <Clock className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                : <Clock className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                            }
                                            <div>
                                                <p className="text-sm font-medium">{ch.label}</p>
                                                <p className="text-xs text-muted-foreground">{ch.title}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            {ch.submitted ? (
                                                <Badge className="bg-green-500/10 text-green-700 border-0 text-[10px]">Done</Badge>
                                            ) : isOverdue ? (
                                                <Badge className="bg-red-500/10 text-red-700 border-0 text-[10px]">Overdue</Badge>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">{daysLeft}d left</span>
                                            )}
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{ch.deadline}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* File Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Documents</CardTitle>
                            <CardDescription>
                                Upload your final report, presentation, and other documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={(e) => addFiles(e.target.files)}
                            />

                            {/* Drop zone */}
                            <div
                                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground mb-2">
                                    Drag and drop files here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supported formats: PDF, DOCX, PPTX (Max 50MB)
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                >
                                    Select Files
                                </Button>
                            </div>

                            {/* Uploaded Files */}
                            <div className="space-y-3">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getDocIcon(doc.type)}
                                            <div>
                                                <p className="font-medium text-sm">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {doc.size} • Uploaded {doc.uploadedAt}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className={doc.status === "approved" ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-0" : ""}>
                                                {doc.status}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(doc)}
                                                disabled={!doc.fileObj}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleDelete(doc.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* External Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle>External Links</CardTitle>
                            <CardDescription>
                                Link your code repository and live demo
                            </CardDescription>
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
                                {codeLink && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Repository linked
                                    </div>
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

                            <div className="pt-4 border-t">
                                <h4 className="font-medium mb-3">Quick Links</h4>
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                            <FileCode className="h-4 w-4" />
                                            Connect to GitHub
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                        <a href="https://gitlab.com" target="_blank" rel="noopener noreferrer">
                                            <FileCode className="h-4 w-4" />
                                            Connect to GitLab
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        size="lg"
                        className="gap-2"
                        disabled={chapters.every(c => c.submitted)}
                        onClick={() => {
                            setChapters(prev => {
                                const idx = prev.findIndex(c => !c.submitted);
                                if (idx === -1) return prev;
                                return prev.map((c, i) => i === idx ? { ...c, submitted: true } : c);
                            });
                        }}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {chapters.every(c => c.submitted) ? "All Chapters Submitted" : `Submit ${chapters.find(c => !c.submitted)?.label}`}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
