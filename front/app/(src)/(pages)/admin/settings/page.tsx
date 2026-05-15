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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Settings,
  Bell,
  User,
  GraduationCap,
  Loader2,
  Save,
  Mail,
  Phone,
  Building2,
  Calendar,
  FileText,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Department Head Profile
  const [profile, setProfile] = useState({
    name: 'Dr. James Mitchell',
    email: 'j.mitchell@university.edu',
    phone: '+1 (555) 987-6543',
    department: 'Computer Science',
    title: 'Department Head',
  });

  // Department Settings
  const [departmentSettings, setDepartmentSettings] = useState({
    maxGroupSize: '5',
    minGroupSize: '2',
    proposalDeadline: '2024-06-30',
    maxAdvisorCapacity: '5',
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    newProposals: true,
    proposalUpdates: true,
    advisorAssignments: true,
    weeklyReports: true,
  });

  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: 'Settings Saved',
        description: 'Department settings have been updated.',
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile and department preferences
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <Building2 className="h-4 w-4" />
            {profile.department} Department
          </Badge>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Your Profile</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  JM
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {profile.title}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    {profile.department}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Profile Form */}
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
                <Label htmlFor="title" className="font-semibold">
                  Title
                </Label>
                <Input
                  id="title"
                  value={profile.title}
                  disabled
                  className="h-11 rounded-xl bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-semibold flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="font-semibold flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" /> Phone
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="h-11 rounded-xl"
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
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Department Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Department Settings</CardTitle>
            </div>
            <CardDescription>
              Configure settings for your department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minGroupSize" className="font-semibold">
                  Minimum Group Size
                </Label>
                <Input
                  id="minGroupSize"
                  type="number"
                  value={departmentSettings.minGroupSize}
                  onChange={(e) =>
                    setDepartmentSettings({
                      ...departmentSettings,
                      minGroupSize: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxGroupSize" className="font-semibold">
                  Maximum Group Size
                </Label>
                <Input
                  id="maxGroupSize"
                  type="number"
                  value={departmentSettings.maxGroupSize}
                  onChange={(e) =>
                    setDepartmentSettings({
                      ...departmentSettings,
                      maxGroupSize: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="proposalDeadline"
                  className="font-semibold flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" /> Proposal Deadline
                </Label>
                <Input
                  id="proposalDeadline"
                  type="date"
                  value={departmentSettings.proposalDeadline}
                  onChange={(e) =>
                    setDepartmentSettings({
                      ...departmentSettings,
                      proposalDeadline: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="maxAdvisorCapacity"
                  className="font-semibold flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" /> Default Advisor Capacity
                </Label>
                <Input
                  id="maxAdvisorCapacity"
                  type="number"
                  value={departmentSettings.maxAdvisorCapacity}
                  onChange={(e) =>
                    setDepartmentSettings({
                      ...departmentSettings,
                      maxAdvisorCapacity: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              className="rounded-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Configure when you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: 'newProposals',
                label: 'New Proposal Submissions',
                desc: 'Get notified when teams submit new proposals',
                icon: FileText,
              },
              {
                key: 'proposalUpdates',
                label: 'Proposal Status Updates',
                desc: 'Notifications when advisors update proposal status',
                icon: FileText,
              },
              {
                key: 'advisorAssignments',
                label: 'Assignment Confirmations',
                desc: 'Confirmation when advisors accept assigned proposals',
                icon: GraduationCap,
              },
              {
                key: 'weeklyReports',
                label: 'Weekly Summary Reports',
                desc: 'Receive weekly overview of department activity',
                icon: Calendar,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
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
      </div>
    </DashboardLayout>
  );
}
