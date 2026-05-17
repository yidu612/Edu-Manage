'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Loader2, Camera, Save } from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function ExaminerSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, mutate } = useSWR('/auth/profile', fetcher);
  const profile = data?.data;

  const [formData, setFormData] = useState({ fullName: '', phone: '', bio: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', password: '', confirm: '' });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName ?? profile.name ?? '',
        phone:    profile.phone ?? '',
        bio:      profile.bio ?? '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullName', formData.fullName);
      if (formData.phone) fd.append('phone', formData.phone);
      if (formData.bio)   fd.append('bio',   formData.bio);
      if (fileRef.current?.files?.[0]) fd.append('imageUrl', fileRef.current.files[0]);
      await api.put('/users/update', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await mutate();
      toast({ title: 'Profile Updated' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.password !== passwords.confirm) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }
    setIsPasswordLoading(true);
    try {
      await api.put('/users/update', { currentPassword: passwords.currentPassword, password: passwords.password });
      setPasswords({ currentPassword: '', password: '', confirm: '' });
      toast({ title: 'Password Updated' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const avatarInitials = (profile?.fullName ?? profile?.name ?? 'E')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout role="examiner">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account details.</p>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /><CardTitle>Profile Information</CardTitle></div>
            <CardDescription>Your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                  {profile?.imageUrl && <AvatarImage src={profile.imageUrl} />}
                  <AvatarFallback className="text-2xl bg-rose-100 text-rose-700">{avatarInitials}</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md" onClick={() => fileRef.current?.click()}>
                  <Camera className="h-4 w-4" />
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{profile?.fullName ?? profile?.name ?? '—'}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email ?? '—'}</p>
                <Badge variant="outline" className="mt-2 bg-rose-50 text-rose-700 border-rose-200">Examiner</Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold">Full Name</Label>
                <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-11 rounded-xl" placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Email Address</Label>
                <Input value={profile?.email ?? ''} disabled className="h-11 rounded-xl bg-muted" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="rounded-full gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><CardTitle>Notifications</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">All in-app notifications appear in your notification panel.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /><CardTitle>Change Password</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-semibold">Current Password</Label>
                <Input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">New Password</Label>
                <Input type="password" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Confirm Password</Label>
                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="h-11 rounded-xl" />
              </div>
            </div>
            <Button onClick={handleChangePassword} variant="outline" className="rounded-full gap-2" disabled={isPasswordLoading}>
              {isPasswordLoading && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
