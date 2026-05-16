'use client';

import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function DiscussionsPage() {
  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discussions</h1>
          <p className="text-muted-foreground">Communicate with your team members and supervisor.</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-24 text-center">
            <div className="mx-auto h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Discussions Coming Soon</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Real-time team discussions are under development. Check back later for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
