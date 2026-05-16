'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Clock, CheckCircle2, ArrowRight, Calendar, FileText, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

const statusConfig = {
  pending:  { label: 'Pending Review', colorClass: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100', icon: Clock },
  approved: { label: 'Approved', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100', icon: CheckCircle2 },
  rejected: { label: 'Rejected', colorClass: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100', icon: XCircle },
  draft:    { label: 'Draft', colorClass: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100', icon: FileText },
};

type Proposal = {
  id: string;
  title: string;
  status: string;
  abstract?: string;
  department?: string;
  student?: { name?: string; email?: string; department?: string };
  createdAt: string;
};

export default function AssignedProposalsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useSWR('/proposals', fetcher);
  const proposals: Proposal[] = data?.data ?? [];

  const filtered = proposals.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.student?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Assigned Proposals</h1>
          <p className="text-muted-foreground">Review and provide feedback on student proposals</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or student..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed rounded-lg">
                {proposals.length === 0 ? "No proposals assigned to you yet." : "No proposals match your search."}
              </div>
            ) : (
              filtered.map((proposal) => {
                const status = statusConfig[proposal.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <Card key={proposal.id} className="hover:shadow-md transition-all hover:border-primary/20 group">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`${status.colorClass} border gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                            {proposal.department && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700">{proposal.department}</Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                            {proposal.title}
                          </CardTitle>
                        </div>
                        {proposal.student?.name && (
                          <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-gray-100 shrink-0">
                            <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-medium">
                              {proposal.student.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      {proposal.abstract && (
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{proposal.abstract}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                          {proposal.student?.name && (
                            <span>Student: {proposal.student.name}</span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Button asChild size="sm" className="gap-2 sm:w-auto w-full">
                          <Link href={`/teacher/proposals/${proposal.id}/review`}>
                            <FileText className="h-4 w-4" />
                            Review Proposal
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
