'use client';

import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Settings,
  User,
  GraduationCap,
  Loader2,
  Save,
  Mail,
  Phone,
  Building2,
  Lock,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    department: '',
    bio: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName:   user.name ?? user.fullName ?? '',
        phone:      (user as Record<string, unknown>).phone as string ?? '',
        department: (user as Record<string, unknown>).department as string ?? '',
        bio:        (user as Record<string, unknown>).bio as string ?? '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('fullName', profile.fullName);
      if (profile.phone) fd.append('phone', profile.phone);
      if (profile.department) fd.append('department', profile.department);
      if (profile.bio) fd.append('bio', profile.bio);

      const res = await api.put('/users/update', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update profile.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 8 characters.' });
      return;
    }
    setIsChangingPassword(true);
    try {
      const fd = new FormData();
      fd.append('currentPassword', passwords.currentPassword);
      fd.append('password', passwords.newPassword);

      await api.put('/users/update', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({ title: 'Password Changed', description: 'Your password has been updated.' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const initials = profile.fullName
    ? profile.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

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
              Manage your profile and account preferences
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm py-1.5 px-3 gap-2">
            <GraduationCap className="h-4 w-4" />
            Admin
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
                <AvatarImage src={(user as Record<string, unknown>)?.imageUrl as string} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{profile.fullName || 'Admin'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Administrator
                  </Badge>
                  {user?.email && (
                    <Badge variant="outline" className="gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-semibold">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  value={user?.email ?? ''}
                  disabled
                  className="h-11 rounded-xl bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="e.g. +1 555 000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Department
                </Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              className="rounded-full gap-2"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-semibold">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="font-semibold">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-semibold">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              variant="outline"
              className="rounded-full gap-2"
              disabled={isChangingPassword || !passwords.currentPassword || !passwords.newPassword}
            >
              {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
