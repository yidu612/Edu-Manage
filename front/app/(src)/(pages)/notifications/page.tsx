'use client';

import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle2, FileText, MessageSquare, AlertCircle, Clock, CheckCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Notification = {
  id: string;
  notificationType: 'feedback' | 'milestone' | 'proposal' | 'system';
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
};

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  feedback:  { icon: CheckCircle2,  color: 'text-emerald-600 bg-emerald-100' },
  milestone: { icon: Clock,         color: 'text-blue-600 bg-blue-100' },
  proposal:  { icon: FileText,      color: 'text-primary bg-primary/10' },
  system:    { icon: AlertCircle,   color: 'text-amber-600 bg-amber-100' },
  message:   { icon: MessageSquare, color: 'text-purple-600 bg-purple-100' },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const role = (user?.role ?? 'student') as 'student' | 'teacher' | 'admin';

  const { data, isLoading, mutate } = useSWR('/notifications', fetcher);
  const notifications: Notification[] = data?.data ?? [];

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      mutate();
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      mutate();
      toast({ title: 'All notifications marked as read.' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to mark all as read.' });
    }
  };

  const NotificationCard = ({ n }: { n: Notification }) => {
    const cfg = typeConfig[n.notificationType] ?? typeConfig.system;
    const Icon = cfg.icon;
    return (
      <Card
        className={`transition-all hover:shadow-md cursor-pointer ${!n.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
        onClick={() => !n.isRead && markAsRead(n.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg shrink-0 ${cfg.color}`}><Icon className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm capitalize">{n.notificationType}</h4>
                  {!n.isRead && <Badge className="h-5 px-1.5 text-[10px] bg-primary">New</Badge>}
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" />{formatTime(n.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="outline" className="text-xs capitalize">{n.priority} priority</Badge>
                {!n.isRead && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}>
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />Mark read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Bell className="h-6 w-6 text-primary" /></div>
              Notifications
            </h1>
            <p className="text-muted-foreground">Stay updated with your project activities</p>
          </div>
          {unread.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />Mark all read
            </Button>
          )}
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2"><CardDescription className="text-primary font-medium">Unread</CardDescription><CardTitle className="text-3xl text-primary">{unread.length}</CardTitle></CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription className="font-medium">Total</CardDescription><CardTitle className="text-3xl">{notifications.length}</CardTitle></CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription className="font-medium">Proposals</CardDescription><CardTitle className="text-3xl">{notifications.filter((n) => n.notificationType === 'proposal').length}</CardTitle></CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription className="font-medium">Milestones</CardDescription><CardTitle className="text-3xl">{notifications.filter((n) => n.notificationType === 'milestone').length}</CardTitle></CardHeader>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="unread" className="w-full">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="unread" className="gap-2">
                Unread {unread.length > 0 && <Badge className="h-5 px-1.5 text-[10px]">{unread.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="mt-6 space-y-3">
              {unread.length === 0 ? (
                <Card className="border-dashed"><CardContent className="py-16 text-center">
                  <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="h-8 w-8" /></div>
                  <h3 className="text-lg font-semibold">All Caught Up!</h3>
                  <p className="text-muted-foreground mt-1">No unread notifications.</p>
                </CardContent></Card>
              ) : (
                unread.map((n) => <NotificationCard key={n.id} n={n} />)
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-6 space-y-3">
              {notifications.length === 0 ? (
                <Card className="border-dashed"><CardContent className="py-16 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Notifications</h3>
                  <p className="text-muted-foreground mt-1">Nothing here yet.</p>
                </CardContent></Card>
              ) : (
                notifications.map((n) => <NotificationCard key={n.id} n={n} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
