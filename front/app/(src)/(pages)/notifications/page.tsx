'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  CheckCircle2,
  FileText,
  MessageSquare,
  Users,
  AlertCircle,
  Clock,
  Trash2,
  CheckCheck,
  Filter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
interface Notification {
  id: string;
  type: 'proposal' | 'team' | 'message' | 'system' | 'review';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'proposal',
    title: 'Proposal Approved',
    description:
      'Your proposal "AI-Powered Student Attendance System" has been approved by Dr. Smith.',
    time: '5 minutes ago',
    read: false,
    actionUrl: '/student/dashboard/proposals/1',
  },
  {
    id: '2',
    type: 'team',
    title: 'New Team Request',
    description: 'Abebe Kebede wants to join your project team.',
    time: '1 hour ago',
    read: false,
    actionUrl: '/student/dashboard/group',
  },
  {
    id: '3',
    type: 'message',
    title: 'New Discussion Reply',
    description:
      'Dr. Johnson replied to your discussion thread about project requirements.',
    time: '2 hours ago',
    read: false,
    actionUrl: '/student/dashboard/discussions',
  },
  {
    id: '4',
    type: 'review',
    title: 'Documentation Feedback',
    description:
      'Your final report received feedback. Please review the comments.',
    time: '3 hours ago',
    read: true,
    actionUrl: '/student/dashboard/documentation',
  },
  {
    id: '5',
    type: 'system',
    title: 'System Maintenance',
    description:
      'Scheduled maintenance on January 25, 2026 from 2:00 AM - 4:00 AM.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '6',
    type: 'proposal',
    title: 'Proposal Needs Revision',
    description:
      'Your proposal "Smart Campus Navigation App" requires revisions. Check the feedback.',
    time: '2 days ago',
    read: true,
    actionUrl: '/student/dashboard/proposals/2',
  },
  {
    id: '7',
    type: 'team',
    title: 'Team Member Left',
    description: 'Tigist Haile has left your project team.',
    time: '3 days ago',
    read: true,
    actionUrl: '/student/dashboard/group',
  },
  {
    id: '8',
    type: 'review',
    title: 'New Assignment',
    description:
      'You have been assigned as advisor for "Library Management System" project.',
    time: '4 days ago',
    read: true,
    actionUrl: '/teacher/dashboard/assigned-proposals',
  },
];

// Helper function to get icon for notification type
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'proposal':
      return FileText;
    case 'team':
      return Users;
    case 'message':
      return MessageSquare;
    case 'review':
      return CheckCircle2;
    case 'system':
      return AlertCircle;
    default:
      return Bell;
  }
};

// Helper function to get icon color
const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'proposal':
      return 'text-blue-600 bg-blue-100';
    case 'team':
      return 'text-purple-600 bg-purple-100';
    case 'message':
      return 'text-green-600 bg-green-100';
    case 'review':
      return 'text-emerald-600 bg-emerald-100';
    case 'system':
      return 'text-amber-600 bg-amber-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | Notification['type']>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const unreadNotifications = filteredNotifications.filter((n) => !n.read);
  const readNotifications = filteredNotifications.filter((n) => n.read);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  const NotificationCard = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);

    return (
      <Card
        className={`transition-all hover:shadow-md cursor-pointer ${
          !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
        }`}
        onClick={() => markAsRead(notification.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <Badge className="h-5 px-1.5 text-[10px] bg-primary">
                      New
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {notification.time}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notification.description}
              </p>
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {notification.type}
                </Badge>
                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Mark read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your project activities and system alerts
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {filter === 'all'
                    ? 'All Types'
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('proposal')}>
                  Proposals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('team')}>
                  Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('message')}>
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('review')}>
                  Reviews
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('system')}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary font-medium">
                Unread
              </CardDescription>
              <CardTitle className="text-3xl text-primary">
                {unreadCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Total</CardDescription>
              <CardTitle className="text-3xl">{notifications.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">
                Proposals
              </CardDescription>
              <CardTitle className="text-3xl">
                {notifications.filter((n) => n.type === 'proposal').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">
                Messages
              </CardDescription>
              <CardTitle className="text-3xl">
                {notifications.filter((n) => n.type === 'message').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Notifications Tabs */}
        <Tabs defaultValue="unread" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="unread" className="gap-2">
                Unread
                {unreadNotifications.length > 0 && (
                  <Badge className="h-5 px-1.5 text-[10px]">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            {readNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
                onClick={clearAllRead}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear read
              </Button>
            )}
          </div>

          <TabsContent value="unread" className="mt-6 space-y-3">
            {unreadNotifications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">All Caught Up!</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                    You have no unread notifications. Check back later for
                    updates.
                  </p>
                </CardContent>
              </Card>
            ) : (
              unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6 space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto h-16 w-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">No Notifications</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                    You don&apos;t have any notifications yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
