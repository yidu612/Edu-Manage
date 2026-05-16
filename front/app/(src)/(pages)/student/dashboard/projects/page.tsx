"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FolderGit2,
  ExternalLink,
  Loader2,
  Search,
  GraduationCap,
  FileSearch,
  Calendar,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

const statusColors: Record<string, string> = {
  draft:        "bg-gray-100 text-gray-700",
  submitted:    "bg-amber-100 text-amber-700",
  under_review: "bg-blue-100 text-blue-700",
  approved:     "bg-emerald-100 text-emerald-700",
  rejected:     "bg-red-100 text-red-700",
};

export default function StudentProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rawProjects, isLoading } = useSWR<any[]>("/projects", fetcher);

  const filteredProjects = useMemo(() => {
    if (!rawProjects) return [];
    return rawProjects.filter((project) => {
      const title = project.title?.toLowerCase() ?? "";
      const search = searchQuery.toLowerCase();
      return title.includes(search);
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

        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">My Projects</h1>
            <p className="text-lg text-muted-foreground">
              Manage your projects and documentation.
            </p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by project title..."
              className="pl-12 h-12 rounded-xl border-gray-200 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-muted/10">
            <FolderGit2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No projects found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {rawProjects?.length === 0
                ? "Submit a proposal to get started."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const advisorName =
                project.mentorId?.name ?? project.mentorId?.fullName ?? "Unassigned";
              const statusCls = statusColors[project.status] ?? statusColors.draft;

              return (
                <Card
                  key={project.id}
                  className="flex flex-col border-none shadow-md ring-1 ring-black/5 hover:ring-emerald-500/40 hover:shadow-xl transition-all duration-300 h-full bg-white rounded-2xl overflow-hidden"
                >
                  <CardHeader className="pb-4 space-y-3 bg-muted/5">
                    <div className="flex justify-between items-center">
                      <Badge className={`text-xs border-0 ${statusCls}`}>
                        {project.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      {project.studentId?.department && (
                        <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
                          {project.studentId.department}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold line-clamp-2 leading-tight text-gray-900">
                      {project.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 pt-4">
                    {project.abstract && (
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {project.abstract}
                      </p>
                    )}

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          <GraduationCap className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Advisor</span>
                          <p className="text-xs font-bold text-gray-800">{advisorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 p-5 pt-0">
                    <Button
                      variant="default"
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold"
                      onClick={() =>
                        router.push(`/student/dashboard/projects/${project.id}/documentation`)
                      }
                    >
                      Manage Documentation
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full h-9 rounded-xl text-muted-foreground hover:text-primary gap-2 text-xs font-medium"
                      onClick={() =>
                        router.push(`/student/dashboard/proposals`)
                      }
                    >
                      View Proposals
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
