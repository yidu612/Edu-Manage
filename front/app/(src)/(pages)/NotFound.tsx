"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    // Logging the 404 error to the browser console
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Grid Pattern (Matching your Hero section) */}
      <div className="bg-grid-pattern grid-mask absolute inset-0 pointer-events-none opacity-40" />

      <div className="relative z-10 text-center px-4">
        {/* Large Decorative 404 */}
        <div className="relative inline-block">
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-primary/10 sm:text-[15rem]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-4 -mt-8 sm:-mt-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Oops! Page not found
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved. 
            Check the URL or return to the dashboard.
          </p>
        </div>

        {/* Action Buttons (Pill-shaped as per your branding) */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="rounded-full px-10 h-12 shadow-lg shadow-primary/20 text-base font-bold" asChild>
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full px-10 h-12 border-primary/20 hover:bg-primary/5 text-base"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>

      {/* Decorative Blur Elements */}
      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}