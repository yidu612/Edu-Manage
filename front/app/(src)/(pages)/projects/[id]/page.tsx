"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { Header } from "@/app/(src)/components/layout/Header";
import { Footer } from "@/app/(src)/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// Custom Separator component
function Separator() {
  return <div style={{ borderBottom: '1px solid #e5e7eb', margin: '2rem 0' }} />;
}
import {
  Star, Calendar, Users, Building2, ArrowLeft, Share2, FileText,
  Presentation, Code, Download, ExternalLink, MessageSquare, Send, Loader2, Info,
  GraduationCap
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  // 1. Fetch Project Details & Reviews
  const { data: project, isLoading } = useSWR(`/projects/${id}`, fetcher);
  const { data: documents = [] } = useSWR(`/projects/${id}/documentation`, fetcher);
  const { data: reviews = [] } = useSWR(`/projects/${id}/reviews`, fetcher);

  // 2. Review Form State
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Derived Data
  const latestVer = project?.proposal?.versions?.[0] || {};
  const approvedDocs = documents.filter((d: any) => d.status === 'approved');
  
  // Find if current user already has a review
  const myExistingReview = useMemo(() => 
    reviews.find((r: any) => r.user_id === user?.id), 
    [reviews, user]
  );

  // --- Handlers ---

  const handleShare = () => {
    // Abuse Prevention: Simple clipboard copy. 
    // Backend rate limiting (implemented earlier) handles API abuse.
    navigator.clipboard.writeText(window.location.href);
    toast.success("Project link copied to clipboard!");
  };

  const handleSubmitReview = async () => {
    if (!user) return toast.error("Please sign in to leave a review.");
    if (newRating === 0) return toast.error("Please select a rating.");

    setIsSubmitting(true);
    try {
      await api.post(`/projects/${id}/reviews`, {
        rate: newRating,
        comment: newComment
      });
      toast.success(myExistingReview ? "Review updated!" : "Review submitted!");
      mutate(`/projects/${id}/reviews`);
      setNewRating(0);
      setNewComment("");
    } catch (err: any) {
      toast.error("Failed to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!project) return <div className="p-20 text-center">Project not found.</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16">
        {/* Back Navigation */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Archive
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* --- LEFT: MAIN CONTENT --- */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{project.department?.name}</Badge>
                  <Badge variant="outline">{new Date(project.created_at).getFullYear()}</Badge>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{latestVer.title}</h1>
                
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400"><Star className="fill-current w-5 h-5"/></div>
                    <span className="font-bold text-lg">{project.rating || "New"}</span>
                    <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Approved: {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full">
                    <Share2 className="mr-2 h-4 w-4" /> Share ({project.share_count || 0})
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Project Summary */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Info className="w-5 h-5 text-primary"/> Project Summary</h2>
                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {project.summary}
                </div>
              </div>

              <Separator />

              {/* REVIEWS SECTION */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Community Reviews
                </h2>

                {/* Review Form (Only for logged in users) */}
                {user ? (
                  <Card className="bg-muted/30 border-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{myExistingReview ? "Update your Review" : "Write a Review"}</CardTitle>
                      <CardDescription>Only one review allowed per user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            onClick={() => setNewRating(s)}
                            className={`w-6 h-6 cursor-pointer ${s <= newRating ? "text-amber-500 fill-current" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                      <Textarea
                        placeholder="Share your thoughts on this implementation..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-white"
                      />
                      <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2 h-4 w-4" />}
                        {myExistingReview ? "Update Review" : "Submit Review"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                    <div className="p-6 text-center border rounded-xl bg-muted/10">
                        <p className="text-sm text-muted-foreground">Please <Link href="/login" className="text-primary font-bold underline">Login</Link> to leave a review.</p>
                    </div>
                )}

                {/* List of Reviews */}
                <div className="space-y-4">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="flex gap-4 p-4 border rounded-xl bg-card">
                        <Avatar><AvatarFallback>{r.user?.name?.[0]}</AvatarFallback></Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                                <span className="font-bold text-sm">{r.user?.name}</span>
                                <div className="flex text-amber-400"><Star className="fill-current w-3 h-3"/> <span className="text-xs ml-1 text-gray-900">{r.rate}</span></div>
                            </div>
                            <p className="text-sm text-gray-600">{r.comment}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- RIGHT: SIDEBAR --- */}
            <div className="space-y-6">
              
              {/* Advisor Card */}
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Project Advisor</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center"><GraduationCap className="text-emerald-600 w-5 h-5"/></div>
                    <div>
                      <p className="font-bold text-sm">{project.proposal?.advisor?.name || "Faculty Advisor"}</p>
                      <p className="text-xs text-muted-foreground">{project.department?.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Development Team</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {project.team?.members?.map((m: any) => (
                    <div key={m.user_id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{m.user?.name?.[0]}</AvatarFallback></Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{m.user?.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Approved Documentation */}
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Resources</CardTitle>
                    <CardDescription className="text-[10px]">Only advisor-verified documents are shown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {approvedDocs.length === 0 && <p className="text-xs text-muted-foreground">No resources published yet.</p>}
                  {approvedDocs.map((doc: any) => {
                    const isLink = doc.document_type.includes('link');
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5 group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {isLink ? <Code className="w-4 h-4 text-blue-500"/> : <FileText className="w-4 h-4 text-red-500"/>}
                          <span className="text-xs font-bold truncate max-w-[120px]">{doc.document_type.replace('_', ' ')}</span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                          <a href={isLink ? doc.url : `http://localhost:8080/${doc.url}`} target="_blank">
                             {isLink ? <ExternalLink className="w-3.5 h-3.5"/> : <Download className="w-3.5 h-3.5"/>}
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}