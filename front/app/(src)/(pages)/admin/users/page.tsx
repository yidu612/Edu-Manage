'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/app/(src)/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  UserPlus,
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Building2,
  Trash2,
  Edit,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';

// Mock Data
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    joinedAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    role: 'student',
    department: 'Software Engineering',
    status: 'active',
    joinedAt: '2024-01-08',
  },
  {
    id: '3',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'teacher',
    department: 'Computer Science',
    status: 'active',
    joinedAt: '2023-09-01',
  },
  {
    id: '4',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    role: 'teacher',
    department: 'Information Technology',
    status: 'active',
    joinedAt: '2022-01-15',
  },
  {
    id: '5',
    name: 'Alice Brown',
    email: 'alice.brown@university.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'pending',
    joinedAt: '2024-01-15',
  },
  {
    id: '6',
    name: 'Bob Wilson',
    email: 'bob.wilson@university.edu',
    role: 'student',
    department: 'Electrical Engineering',
    status: 'pending',
    joinedAt: '2024-01-14',
  },
];

const roleConfig = {
  student: {
    label: 'Student',
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-700',
  },
  teacher: {
    label: 'Teacher',
    icon: BookOpen,
    color: 'bg-emerald-100 text-emerald-700',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'bg-purple-100 text-purple-700',
  },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
};

export default function UserManagementPage() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockUsers)[0] | null
  >(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<
    'approve' | 'reject' | 'edit' | 'delete'
  >('approve');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const pendingUsers = mockUsers.filter((u) => u.status === 'pending');
  const activeUsers = mockUsers.filter((u) => u.status === 'active');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAction = (
    user: (typeof mockUsers)[0],
    action: typeof dialogAction,
  ) => {
    setSelectedUser(user);
    setDialogAction(action);
    setShowUserDialog(true);
  };

  const confirmAction = () => {
    if (!selectedUser) return;

    const messages = {
      approve: {
        title: 'User Approved',
        desc: `${selectedUser.name} has been approved and can now access the platform.`,
      },
      reject: {
        title: 'User Rejected',
        desc: `${selectedUser.name}'s registration has been rejected.`,
      },
      edit: {
        title: 'User Updated',
        desc: `${selectedUser.name}'s information has been updated.`,
      },
      delete: {
        title: 'User Deleted',
        desc: `${selectedUser.name} has been removed from the platform.`,
      },
    };

    toast({
      title: messages[dialogAction].title,
      description: messages[dialogAction].desc,
    });
    setShowUserDialog(false);
  };

  const UserCard = ({ user }: { user: (typeof mockUsers)[0] }) => {
    const role = roleConfig[user.role as keyof typeof roleConfig];
    const status = statusConfig[user.status as keyof typeof statusConfig];
    const RoleIcon = role.icon;

    return (
      <Card className="hover:shadow-md transition-all hover:border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-background shadow">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{user.name}</h4>
                  <Badge
                    variant="outline"
                    className={`${status.color} border-none text-xs`}
                  >
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${role.color} border-none gap-1`}
                  >
                    <RoleIcon className="h-3 w-3" />
                    {role.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    {user.department}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user.status === 'pending' ? (
                <>
                  <Button
                    size="sm"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 gap-1"
                    onClick={() => handleAction(user, 'approve')}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-red-600 border-red-200 hover:bg-red-50 gap-1"
                    onClick={() => handleAction(user, 'reject')}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleAction(user, 'edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                    onClick={() => handleAction(user, 'delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and registration requests.
            </p>
          </div>
          <Button className="rounded-full gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Users
              </CardDescription>
              <CardTitle className="text-3xl text-blue-900">
                {mockUsers.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Students
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">
                {mockUsers.filter((u) => u.role === 'student').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Teachers
              </CardDescription>
              <CardTitle className="text-3xl text-purple-900">
                {mockUsers.filter((u) => u.role === 'teacher').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">
                {pendingUsers.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-fit">
              <TabsTrigger value="all">
                All Users ({mockUsers.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingUsers.length})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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

          <TabsContent value="all" className="mt-6 space-y-4">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="mt-6 space-y-4">
            {pendingUsers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    All registration requests have been processed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingUsers.map((user) => <UserCard key={user.id} user={user} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogAction === 'approve' && (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              )}
              {dialogAction === 'reject' && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {dialogAction === 'delete' && (
                <Trash2 className="h-5 w-5 text-red-600" />
              )}
              {dialogAction === 'edit' && (
                <Edit className="h-5 w-5 text-primary" />
              )}
              {dialogAction.charAt(0).toUpperCase() + dialogAction.slice(1)}{' '}
              User
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve' &&
                `Approve ${selectedUser?.name}'s registration request?`}
              {dialogAction === 'reject' &&
                `Reject ${selectedUser?.name}'s registration request?`}
              {dialogAction === 'delete' &&
                `Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
              {dialogAction === 'edit' &&
                `Edit ${selectedUser?.name}'s account information.`}
            </DialogDescription>
          </DialogHeader>

          {dialogAction === 'edit' && selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select defaultValue={selectedUser.department}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="Software Engineering">
                      Software Engineering
                    </SelectItem>
                    <SelectItem value="Information Technology">
                      Information Technology
                    </SelectItem>
                    <SelectItem value="Electrical Engineering">
                      Electrical Engineering
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowUserDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className={`rounded-full ${
                dialogAction === 'reject' || dialogAction === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }`}
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
