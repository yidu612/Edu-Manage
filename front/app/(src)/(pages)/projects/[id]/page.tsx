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
function Separator() {
  return <div style={{ borderBottom: "1px solid #e5e7eb", margin: "2rem 0" }} />;
}
import {
  Star,
  Calendar,
  ArrowLeft,
  Share2,
  FileText,
  Code,
  Download,
  ExternalLink,
  MessageSquare,
  Send,
  Loader2,
  Info,
  GraduationCap,
  User,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const { data: project, isLoading } = useSWR(`/public/projects/${id}`, fetcher);
  const { data: documents = [] } = useSWR(`/public/projects/${id}/documentation`, fetcher);
  const { data: reviews = [] } = useSWR(`/public/projects/${id}/reviews`, fetcher);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedDocs = documents.filter((d: any) => d.status === "approved");

  const myExistingReview = useMemo(
    () => reviews.find((r: any) => r.user_id === user?.id),
    [reviews, user]
  );

  const avgRating = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc: number, r: any) => acc + (r.rate ?? 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Project link copied to clipboard!");
  };

  const handleSubmitReview = async () => {
    if (!user) return toast.error("Please sign in to leave a review.");
    if (newRating === 0) return toast.error("Please select a rating.");

    setIsSubmitting(true);
    try {
      await api.post(`/projects/${id}/reviews`, { rate: newRating, comment: newComment });
      toast.success(myExistingReview ? "Review updated!" : "Review submitted!");
      mutate(`/public/projects/${id}/reviews`);
      setNewRating(0);
      setNewComment("");
    } catch {
      toast.error("Failed to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!project) return <div className="p-20 text-center">Project not found.</div>;

  const studentName = project.studentId?.name ?? project.studentId?.fullName ?? "Student";
  const advisorName = project.mentorId?.name ?? project.mentorId?.fullName ?? "Faculty Advisor";
  const department  = project.studentId?.department ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16">
        {/* Back Navigation */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Archive
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">

            {/* LEFT: MAIN CONTENT */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {department && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                      {department}
                    </Badge>
                  )}
                  <Badge variant="outline">{new Date(project.createdAt).getFullYear()}</Badge>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                  {project.title}
                </h1>

                <div className="mt-6 flex flex-wrap items-center gap-6">
                  {avgRating && (
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        <Star className="fill-current w-5 h-5" />
                      </div>
                      <span className="font-bold text-lg">{avgRating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="rounded-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Abstract / Summary */}
              {(project.abstract || project.objectives) && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" /> Project Summary
                    </h2>
                    <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                      {project.abstract ?? project.objectives}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* REVIEWS SECTION */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Community Reviews
                </h2>

                {user ? (
                  <Card className="bg-muted/30 border-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {myExistingReview ? "Update your Review" : "Write a Review"}
                      </CardTitle>
                      <CardDescription>Only one review allowed per user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            onClick={() => setNewRating(s)}
                            className={`w-6 h-6 cursor-pointer ${
                              s <= newRating ? "text-amber-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Textarea
                        placeholder="Share your thoughts on this project..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-white"
                      />
                      <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <Loader2 className="animate-spin mr-2" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        {myExistingReview ? "Update Review" : "Submit Review"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-6 text-center border rounded-xl bg-muted/10">
                    <p className="text-sm text-muted-foreground">
                      Please{" "}
                      <Link href="/login" className="text-primary font-bold underline">
                        Login
                      </Link>{" "}
                      to leave a review.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No reviews yet. Be the first to leave one!
                    </p>
                  )}
                  {reviews.map((r: any) => (
                    <div key={r.id} className="flex gap-4 p-4 border rounded-xl bg-card">
                      <Avatar>
                        <AvatarFallback>{r.user?.name?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-sm">{r.user?.name}</span>
                          <div className="flex text-amber-400">
                            <Star className="fill-current w-3 h-3" />
                            <span className="text-xs ml-1 text-gray-900">{r.rate}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{r.comment}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: SIDEBAR */}
            <div className="space-y-6">

              {/* Advisor Card */}
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Project Advisor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <GraduationCap className="text-emerald-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{advisorName}</p>
                      {department && (
                        <p className="text-xs text-muted-foreground">{department}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student / Author Card */}
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Author
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <User className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{studentName}</p>
                      {project.studentId?.email && (
                        <p className="text-xs text-muted-foreground">{project.studentId.email}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approved Documentation */}
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Resources
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Only advisor-verified documents are shown
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {approvedDocs.length === 0 && (
                    <p className="text-xs text-muted-foreground">No resources published yet.</p>
                  )}
                  {approvedDocs.map((doc: any) => {
                    const isLink =
                      doc.documentType === "code_link" || doc.documentType === "demo_link";
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/5 group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {isLink ? (
                            <Code className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs font-bold truncate max-w-[120px]">
                            {doc.documentType.replace("_", " ")}
                          </span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            {isLink ? (
                              <ExternalLink className="w-3.5 h-3.5" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
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
