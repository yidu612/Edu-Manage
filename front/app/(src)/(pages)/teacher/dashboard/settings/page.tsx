'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Loader2, Camera, Save } from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';

export default function TeacherSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    employeeId: 'TCH/2015/042',
    department: 'Computer Science',
    title: 'Associate Professor',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newProposals: true,
    revisionAlerts: true,
    systemAnnouncements: true,
  });

  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and notification preferences.
          </p>
        </div>

        {/* Profile Section */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Your personal and professional details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    SJ
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{profile.department}</Badge>
                  <Badge variant="outline">{profile.title}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="font-semibold">
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  value={profile.employeeId}
                  disabled
                  className="h-11 rounded-xl bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-11 rounded-xl bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="font-semibold">
                  Department
                </Label>
                <Input
                  id="department"
                  value={profile.department}
                  disabled
                  className="h-11 rounded-xl bg-muted"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              className="rounded-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: 'emailNotifications',
                label: 'Email Notifications',
                desc: 'Receive notifications via email',
              },
              {
                key: 'newProposals',
                label: 'New Proposal Alerts',
                desc: 'Get notified when new proposals are assigned',
              },
              {
                key: 'revisionAlerts',
                label: 'Revision Submissions',
                desc: 'Alerts when students submit revisions',
              },
              {
                key: 'systemAnnouncements',
                label: 'System Announcements',
                desc: 'Platform updates and maintenance notices',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Button
                  variant={
                    notifications[item.key as keyof typeof notifications]
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      [item.key]:
                        !notifications[item.key as keyof typeof notifications],
                    })
                  }
                >
                  {notifications[item.key as keyof typeof notifications]
                    ? 'On'
                    : 'Off'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your password and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="rounded-full">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
