"use client";

import { useState } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { ProposalCard } from "@/app/(src)/components/dashboard/ProposalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

function mapStatus(s: string): "draft" | "under_review" | "approved" | "rejected" {
  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  if (s === "draft") return "draft";
  return "under_review";
}

export default function MyProposalsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useSWR("/proposals", fetcher);
  const proposals: Array<{ id: string; title: string; status: string; department?: string; abstract?: string; teacher?: { name?: string }; createdAt: string }> =
    data?.data ?? [];

  const filtered = proposals.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const mappedStatus = mapStatus(p.status);
    const matchesStatus = statusFilter === "all" || mappedStatus === statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
            <p className="text-muted-foreground text-lg">Manage and track your project submissions.</p>
          </div>
          <Button
            className="rounded-full bg-primary shadow-lg shadow-primary/20 gap-2 h-11 px-6"
            onClick={() => router.push("/student/dashboard/proposals/new")}
          >
            <Plus className="h-4 w-4" /> New Proposal
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              className="pl-10 rounded-full border-primary/10 bg-muted/30 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-full border-primary/10 h-11">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-12">
                {proposals.length === 0 ? "No proposals yet. Create your first one!" : "No proposals match your search."}
              </p>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/student/dashboard/proposals/${p.id}`)}
                  className="cursor-pointer"
                >
                  <ProposalCard
                    id={p.id}
                    title={p.title}
                    description={p.abstract}
                    status={mapStatus(p.status)}
                    department={p.department}
                    supervisor={p.teacher?.name}
                    date={new Date(p.createdAt).toLocaleDateString()}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
