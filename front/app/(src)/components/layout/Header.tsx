"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, Bell } from "lucide-react";
// import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  return (
    // FIXED: Added 'fixed top-0 left-0 right-0' to ensure it stays pinned 
    // regardless of parent container overflow settings.
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left: Logo & Menu Trigger */}
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick} 
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none tracking-tight text-foreground">
                ASTU Project Hub
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                CSE & Software Engineering
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation (Hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/projects" className="text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-600">
            Public Projects
          </Link>
          <Link href="/guidelines" className="text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-600">
            Guidelines
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hidden sm:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
          </Button>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <Button variant="ghost" size="sm" asChild className="font-semibold">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 shadow-sm shadow-emerald-200" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}