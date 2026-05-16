'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Users, GraduationCap, BookOpen, Shield, Mail, Building2, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

const roleConfig = {
  student: { label: 'Student', icon: GraduationCap, color: 'bg-blue-100 text-blue-700' },
  teacher: { label: 'Teacher', icon: BookOpen, color: 'bg-emerald-100 text-emerald-700' },
  admin:   { label: 'Admin',   icon: Shield,       color: 'bg-purple-100 text-purple-700' },
};

type User = { id: string; name: string; email: string; role: string; department?: string; createdAt?: string };

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data, isLoading } = useSWR('/users', fetcher);
  const users: User[] = data?.data ?? [];

  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const UserCard = ({ user }: { user: User }) => {
    const role = roleConfig[user.role as keyof typeof roleConfig] ?? roleConfig.student;
    const RoleIcon = role.icon;

    return (
      <Card className="hover:shadow-md transition-all hover:border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-background shadow">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="font-semibold truncate">{user.name}</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`${role.color} border-none gap-1`}>
                  <RoleIcon className="h-3 w-3" />{role.label}
                </Badge>
                {user.department && (
                  <Badge variant="secondary" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />{user.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and roles.</p>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Total Users</CardDescription>
              <CardTitle className="text-3xl text-blue-900">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Students</CardDescription>
              <CardTitle className="text-3xl text-emerald-900">{students.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2"><BookOpen className="h-4 w-4" /> Teachers</CardDescription>
              <CardTitle className="text-3xl text-purple-900">{teachers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> Admins</CardDescription>
              <CardTitle className="text-3xl text-amber-900">{users.filter((u) => u.role === 'admin').length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-fit">
              <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
              <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
              <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10 rounded-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-35 rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <TabsContent value="all" className="mt-6 space-y-4">
                {filteredUsers.map((user) => <UserCard key={user.id} user={user} />)}
                {filteredUsers.length === 0 && <p className="text-muted-foreground text-center py-8">No users found.</p>}
              </TabsContent>
              <TabsContent value="students" className="mt-6 space-y-4">
                {students.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => <UserCard key={u.id} user={u} />)}
              </TabsContent>
              <TabsContent value="teachers" className="mt-6 space-y-4">
                {teachers.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => <UserCard key={u.id} user={u} />)}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
