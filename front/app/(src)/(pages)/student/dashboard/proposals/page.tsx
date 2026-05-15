"use client";

import { useState } from "react";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { ProposalCard } from "@/app/(src)/components/dashboard/ProposalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

const mockProposals = [
  { id: "1", title: "AI-Powered Student Performance Analytics", status: "under_review" as const, lastUpdated: "2024-01-15", supervisor: "Dr. Sarah Johnson", feedback: 2 },
  { id: "2", title: "Blockchain-Based Certificate Verification", status: "revision_requested" as const, lastUpdated: "2024-01-12", supervisor: "Prof. Michael Chen", feedback: 3 },
  { id: "3", title: "Smart Campus IoT Integration", status: "draft" as const, lastUpdated: "2024-01-10" },
];

export default function MyProposalsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockProposals.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
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
          <Button className="rounded-full bg-primary shadow-lg shadow-primary/20 gap-2 h-11 px-6" onClick={() => router.push("/student/dashboard/proposals/new")}>
            <Plus className="h-4 w-4" /> New Proposal
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search proposals..." className="pl-10 rounded-full border-primary/10 bg-muted/30 h-11" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <SelectItem value="revision_requested">Revision Requested</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-12">No proposals match your search.</p>
          ) : filtered.map((proposal) => (
            <div key={proposal.id} onClick={() => router.push(`/student/dashboard/proposals/${proposal.id}`)} className="cursor-pointer">
              <ProposalCard {...proposal} />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}