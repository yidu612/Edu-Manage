"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Header } from "@/app/(src)/components/layout/Header";
import { Footer } from "@/app/(src)/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Calendar, Users, ExternalLink, Loader2 } from "lucide-react";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Project = {
  id: string;
  title: string;
  abstract?: string;
  objectives?: string;
  status: string;
  studentId?: { id: string; name?: string; fullName?: string; department?: string };
  mentorId?: { id: string; name?: string; fullName?: string };
  createdAt: string;
};

const YEARS = ["All Years"];
for (let y = new Date().getFullYear(); y >= 2022; y--) YEARS.push(String(y));

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [visibleCount, setVisibleCount] = useState(6);

  const { data, isLoading } = useSWR('/public/projects', fetcher);
  const projects: Project[] = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const dept = p.studentId?.department ?? '';
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q) ||
        (p.abstract ?? '').toLowerCase().includes(q);
      const matchesYear =
        yearFilter === 'All Years' ||
        new Date(p.createdAt).getFullYear().toString() === yearFilter;
      return matchesSearch && matchesYear;
    });
  }, [projects, search, yearFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b bg-muted/30 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Public Project Archive
              </h1>
              <p className="mt-4 text-lg text-muted-foreground text-balance">
                Explore{" "}
                <span className="text-primary font-semibold">{projects.length}</span>{" "}
                approved student projects. Innovative solutions driving academic excellence.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mx-auto mt-10 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-4 sm:flex-row p-3 bg-white rounded-3xl shadow-xl shadow-primary/5 border">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, department or keywords..."
                    className="pl-11 rounded-2xl border-none bg-muted/50 h-12 focus-visible:ring-primary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full sm:w-36 rounded-2xl border-none bg-muted/50 h-12">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Approved Projects</h2>
                <p className="text-sm text-muted-foreground">
                  {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <Button variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5 h-10">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">
                {projects.length === 0
                  ? "No approved projects published yet."
                  : "No projects match your search."}
              </p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((project, index) => {
                  const dept = project.studentId?.department ?? '';
                  const year = new Date(project.createdAt).getFullYear();
                  const preview = project.abstract ?? project.objectives ?? '';
                  return (
                    <Card
                      key={project.id}
                      className="animate-in fade-in slide-in-from-bottom-6 flex flex-col group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-primary/10 overflow-hidden"
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          {dept && (
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none font-bold px-2 py-0.5">
                              {dept}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors leading-snug">
                          {project.title}
                        </CardTitle>
                        {preview && (
                          <CardDescription className="line-clamp-3 text-sm leading-relaxed mt-2 text-muted-foreground/80">
                            {preview}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="mt-auto space-y-6">
                        {/* Meta info */}
                        <div className="flex items-center justify-between border-t border-muted pt-4 text-xs">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              {year}
                            </span>
                            {project.mentorId?.name && (
                              <span className="flex items-center gap-1.5 font-medium">
                                <Users className="h-3.5 w-3.5 text-primary" />
                                {project.mentorId.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="default"
                          className="w-full rounded-2xl gap-2 h-11 font-bold group-hover:shadow-lg transition-all"
                          onClick={() => router.push(`/projects/${project.id}`)}
                        >
                          Explore Project
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {!isLoading && (
              <div className="mt-20 text-center space-y-4">
                <p className="text-sm text-muted-foreground font-medium">
                  Viewing {Math.min(visible.length, filtered.length)} of {filtered.length} projects
                </p>
                {hasMore && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-12 h-14 border-primary/30 hover:bg-primary/5 text-primary font-bold"
                    onClick={() => setVisibleCount((c) => c + 6)}
                  >
                    Load More
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
