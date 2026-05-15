"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { GraduationCap, Lock, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/app/(src)/hooks/use-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ password: "", confirm: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm) {
      return toast({ 
        variant: "destructive", 
        title: "Passwords mismatch",
        description: "The two passwords you entered do not match."
      });
    }

    setIsLoading(true);

    // Simulate password update
    setTimeout(() => {
      toast({ 
        title: "Success!", 
        description: "Your password has been updated. Please sign in." 
      });
      router.push("/login");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Form Container */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm space-y-8">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Project Hub</span>
          </Link>

          <Card className="border-none shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-3xl font-bold tracking-tight">New Password</CardTitle>
              <CardDescription className="text-base">
                Create a strong, unique password for your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="ml-1 font-semibold">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      className="pl-11 rounded-full h-12 border-muted focus-visible:ring-primary" 
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="ml-1 font-semibold">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      className="pl-11 rounded-full h-12 border-muted focus-visible:ring-primary" 
                      onChange={e => setFormData({...formData, confirm: e.target.value})}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-6 pt-6">
                <Button type="submit" className="w-full rounded-full h-12 text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Update Password 
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Link href="/login" className="flex items-center justify-center text-sm font-bold text-primary hover:underline gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Return to login
                </Link>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Right side - Decorative Sidebar (Emerald Gradient + Grid) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center bg-primary relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="relative px-16 text-primary-foreground max-w-xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold tracking-tight leading-tight">Security <br/>First.</h2>
            <p className="text-xl opacity-80 leading-relaxed max-w-md">
              We take your project data seriously. Use a mix of letters, numbers, and symbols to keep your account secure.
            </p>
            <div className="pt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-white/20 backdrop-blur-sm" />
                ))}
              </div>
              <p className="text-sm font-medium">Trusted by 10,000+ students</p>
            </div>
          </div>
        </div>

        {/* Decorative background blur elements */}
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-[100px] animate-pulse" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-[100px] animate-pulse" />
      </div>
    </div>
  );
}