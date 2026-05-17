"use client";

import { useState } from "react";
import Link from "next/link";
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
import { GraduationCap, Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import { useToast } from "@/app/(src)/hooks/use-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show the same message regardless of whether the email exists
      setSent(true);
      toast({
        title: "Check your inbox",
        description: "If an account is registered for that email, a reset link has been sent.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "Could not reach the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm space-y-8">
          
          <Link href="/login" className="flex items-center gap-3 group w-fit">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Project Hub</span>
          </Link>

          <Card className="border-none shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-3xl font-bold tracking-tight">Recover Password</CardTitle>
              <CardDescription className="text-base">
                {sent
                  ? "If an account is registered for that email, a reset link has been sent. Check your inbox."
                  : "Enter your email and we'll send you a reset link"}
              </CardDescription>
            </CardHeader>

            {!sent && (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="font-semibold ml-1">University Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@university.edu"
                        className="pl-11 rounded-full h-12 border-muted focus-visible:ring-primary"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-6 pt-6">
                  <Button type="submit" className="w-full rounded-full h-12 text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Reset Link <Send className="ml-2 h-4 w-4" /></>}
                  </Button>
                  <Link href="/login" className="flex items-center justify-center text-sm font-bold text-primary hover:underline gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </CardFooter>
              </form>
            )}

            {sent && (
              <CardFooter className="pt-0 pb-6">
                <Link href="/login" className="flex items-center justify-center text-sm font-bold text-primary hover:underline gap-2 w-full">
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="relative px-16 text-primary-foreground max-w-xl mx-auto">
          <h2 className="text-5xl font-extrabold tracking-tight leading-tight">Don&apos;t worry, <br/>we got you.</h2>
          <p className="mt-6 text-xl opacity-80 leading-relaxed">Resetting your password is quick and secure. Follow the link in your email to get back to your projects.</p>
        </div>
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-[100px] animate-pulse" />
      </div>
    </div>
  );
}