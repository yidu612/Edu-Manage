"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  FolderGit2,
  Users,
  ExternalLink,
  Loader2,
  Globe,
  Lock,
  Search,
  GraduationCap,
  FileSearch,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function StudentProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rawProjects, isLoading } = useSWR<any[]>("/projects", fetcher);

  const filteredProjects = useMemo(() => {
    if (!rawProjects) return [];
    return rawProjects.filter((project) => {
      const title = project.proposal?.versions?.[0]?.title?.toLowerCase() || "";
      const team = project.team?.name?.toLowerCase() || "";
      const search = searchQuery.toLowerCase();
      return title.includes(search) || team.includes(search);
    });
  }, [rawProjects, searchQuery]);

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-8 px-4 py-6 md:px-6 lg:px-8 w-full animate-in fade-in duration-700">
        
        {/* Header & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Active Projects</h1>
            <p className="text-lg text-muted-foreground">
              Manage your approved capstone projects and documentation.
            </p>
          </div>
          
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by project title or team name..."
              className="pl-12 h-12 rounded-xl border-gray-200 shadow-sm focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-muted/10">
            <FolderGit2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No active projects found</h3>
            <p className="text-muted-foreground">Adjust your search or check your proposal status.</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const latestVer = project.proposal?.versions?.[0] || {};
              const members = project.team?.members || [];
              const advisorName = project.proposal?.advisor?.name || "Advisor Assigned";

              return (
                <Card
                  key={project.id}
                  className="flex flex-col border-none shadow-md ring-1 ring-black/5 hover:ring-emerald-500/40 hover:shadow-xl transition-all duration-300 h-full bg-white rounded-2xl overflow-hidden"
                >
                  <CardHeader className="pb-4 space-y-4 bg-muted/5">
                    <div className="flex justify-between items-center">
                      <Badge
                        className={
                          project.visibility === "public"
                            ? "bg-emerald-100 text-emerald-800 border-none px-3"
                            : "bg-blue-100 text-blue-800 border-none px-3"
                        }
                      >
                        {project.visibility === "public" ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                        {project.visibility.toUpperCase()}
                      </Badge>
                      <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
                        {project.department?.name || "Department"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold line-clamp-2 leading-tight min-h-[3.5rem] text-gray-900">
                        {latestVer.title || "Untitled Project"}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Users className="h-4 w-4" />
                        <span>{project.team?.name}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-6 pt-6">
                    {/* Clamped Abstract to prevent overflow */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Project Summary</Label>
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                            {project.summary || "The official summary for this project is being compiled from the approved proposal."}
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                      {/* Advisor Section */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          <GraduationCap className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Advisor</span>
                          <span className="text-xs font-bold text-gray-800 truncate max-w-[120px]">{advisorName}</span>
                        </div>
                      </div>

                      {/* Members Avatars */}
                      <div className="flex -space-x-2">
                        {members.slice(0, 4).map((m: any, i: number) => (
                          <Avatar key={i} className="h-9 w-9 border-2 border-white shadow-sm">
                            <AvatarFallback className="text-[10px] bg-emerald-50 text-emerald-700 font-bold">
                              {m.user?.name?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {members.length > 4 && (
                          <div className="h-9 w-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm">
                            +{members.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3 p-6 pt-0">
                    <Button
                      variant="default"
                      className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 gap-2 font-bold"
                      onClick={() => router.push(`/student/dashboard/projects/${project.id}/documentation`)}
                    >
                      Project Management
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full h-10 rounded-xl text-muted-foreground hover:text-primary gap-2 text-xs font-medium"
                      onClick={() => router.push(`/student/dashboard/proposals/${project.proposal_id}`)}
                    >
                      View Original Proposal
                      <FileSearch className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}