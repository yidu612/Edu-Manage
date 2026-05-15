'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/app/(src)/hooks/use-toast';
import { registerUser } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast({
        variant: 'destructive',
        title: 'Passwords mismatch',
        description: 'Please make sure both passwords match.',
      });
    }

    if (!formData.role || !formData.department) {
      return toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please select your role and department.',
      });
    }

    setIsLoading(true);

    const result = registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    if (!result.success) {
      toast({ variant: 'destructive', title: 'Sign up failed', description: result.message });
      setIsLoading(false);
      return;
    }

    toast({ title: 'Account created!', description: 'Please sign in with your new account.' });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Decorative Sidebar (Emerald/Teal Gradient) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center bg-primary relative overflow-hidden">
        {/* The Grid Pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative px-16 text-primary-foreground max-w-xl mx-auto">
          <div className="space-y-10">
            <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
              Join the <br />
              Project Community
            </h2>
            <ul className="space-y-6">
              {[
                'Create and submit project proposals',
                'Collaborate with team members',
                'Get AI-powered feedback',
                'Track progress in real-time',
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-medium opacity-90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Decorative background blur elements */}
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-[100px] animate-pulse" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-[100px] animate-pulse" />
      </div>

      {/* Right side - Form Container */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Project Hub
            </span>
          </Link>

          <Card className="border-none shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Create account
              </CardTitle>
              <CardDescription className="text-base">
                Start your academic project journey today
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="font-semibold ml-1">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-11 rounded-full h-11 border-muted focus-visible:ring-primary"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-semibold ml-1">
                    University Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@university.edu"
                      className="pl-11 rounded-full h-11 border-muted focus-visible:ring-primary"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Role & Dept Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="font-semibold ml-1">Role</Label>
                    <Select
                      disabled={isLoading}
                      onValueChange={(value: string) =>
                        handleChange('role', value)
                      }
                    >
                      <SelectTrigger className="rounded-full h-11 border-muted focus:ring-primary">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold ml-1">Department</Label>
                    <Select
                      disabled={isLoading}
                      onValueChange={(value: string) =>
                        handleChange('department', value)
                      }
                    >
                      <SelectTrigger className="rounded-full h-11 border-muted focus:ring-primary">
                        <SelectValue placeholder="Select dept" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="eng">Engineering</SelectItem>
                        <SelectItem value="bus">Business</SelectItem>
                        <SelectItem value="art">Arts & Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="password"
                      title="Password"
                      className="font-semibold ml-1"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 rounded-full h-11 border-muted focus-visible:ring-primary"
                        value={formData.password}
                        onChange={(e) =>
                          handleChange('password', e.target.value)
                        }
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      title="Confirm"
                      className="font-semibold ml-1"
                    >
                      Confirm
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 rounded-full h-11 border-muted focus-visible:ring-primary"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange('confirmPassword', e.target.value)
                        }
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-6 pt-4">
                <Button
                  type="submit"
                  className="w-full rounded-full h-12 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-bold text-primary hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/60 px-6">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
