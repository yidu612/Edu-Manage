"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { StatsCard } from "@/app/(src)/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  AlertTriangle,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users
} from "lucide-react";

// --- Mock Data ---
const proposals = [
  { 
    id: "1", 
    title: "AI-Powered Student Performance Analytics", 
    students: ["John Doe", "Jane Smith", "Mike Johnson"], 
    status: "pending_review", 
    date: "2024-01-15" 
  },
  { 
    id: "2", 
    title: "Blockchain-Based Certificate Verification", 
    students: ["Alice Brown", "Bob Wilson"], 
    status: "revision_submitted", 
    date: "2024-01-14" 
  },
  { 
    id: "3", 
    title: "Smart Campus IoT Integration", 
    students: ["Emily Davis"], 
    status: "pending_review", 
    date: "2024-01-13" 
  },
  { 
    id: "4", 
    title: "E-Learning Platform Enhancement", 
    students: ["Chris Lee", "David Park"], 
    status: "approved", 
    date: "2024-01-10" 
  },
];

const activities = [
  { initials: "JD", name: "John Doe", action: "submitted a revision", time: "2 hours ago" },
  { initials: "AB", name: "Alice Brown", action: "responded to feedback", time: "5 hours ago" },
  { initials: "ED", name: "Emily Davis", action: "submitted new proposal", time: "Yesterday" },
];

const analytics = [
  { label: "Computer Science", value: 12, total: 15 },
  { label: "Electrical Engineering", value: 8, total: 12 },
  { label: "Information Technology", value: 5, total: 10 },
];

// --- Components ---

// Helper for status badges to match the image colors
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    pending_review: "bg-amber-100 text-amber-700 border-amber-200",
    revision_submitted: "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const icons = {
    pending_review: <Clock className="w-3 h-3 mr-1" />,
    revision_submitted: <AlertCircle className="w-3 h-3 mr-1" />,
    approved: <CheckCircle2 className="w-3 h-3 mr-1" />,
  };

  const labels = {
    pending_review: "Pending Review",
    revision_submitted: "Revision Submitted",
    approved: "Approved",
  };

  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 font-medium ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof styles]}
      {labels[status as keyof typeof styles]}
    </Badge>
  );
};

export default function TeacherDashboardPage() {
  const router = useRouter();

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
          <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground text-lg text-balance">
            Review and manage assigned student proposals.
          </p>
        </div>
 {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Pending Review" value={2} icon={Clock} trend={{ value: 2, isPositive: false }} />
          <StatsCard title="Revisions" value={1} icon={AlertTriangle} />
          <StatsCard title="Approved" value={12} icon={CheckCircle2} trend={{ value: 15, isPositive: true }} />
          <StatsCard title="Total Assigned" value={15} icon={FileText} />
        </div>
        {/* Top Section: Assigned Proposals Card */}
        <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Assigned Proposals</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Proposals waiting for your review and feedback</p>
            </div>
            <Button variant="outline" className="hidden sm:flex text-xs h-8">View All</Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {proposals.map((item) => (
              <div 
                key={item.id} 
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer bg-white"
                onClick={() => router.push(`/teacher/proposals/${item.id}/review`)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon Box */}
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  
                  {/* Text Content */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-400" />
                        {item.students.join(", ")}
                      </span>
                      <span className="hidden sm:block text-gray-300">|</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {item.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Action */}
                <div className="mt-4 md:mt-0 flex items-center justify-end md:justify-start gap-2 text-sm font-medium text-gray-600 group-hover:text-emerald-700 transition-colors">
                  <span>Review</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
            
            {/* Mobile View All Button */}
            <Button variant="outline" className="w-full sm:hidden mt-2">View All Proposals</Button>
          </CardContent>
        </Card>

        {/* Bottom Section: Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    {/* Connecting Line (except last item) */}
                    {i !== activities.length - 1 && (
                      <div className="absolute left-[1.125rem] top-10 bottom-[-1.5rem] w-px bg-gray-100" />
                    )}
                    
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                      {act.initials}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{act.name}</span> {act.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Analytics */}
          <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-white h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Department Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {analytics.map((dept, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{dept.label}</span>
                    <span className="text-muted-foreground">{dept.value} <span className="text-xs">/ {dept.total}</span></span>
                  </div>
                  {/* Custom Progress Bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${(dept.value / dept.total) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}