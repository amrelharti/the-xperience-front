"use client";

import { memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useUser } from "../hooks/useUser";
import UserDropdown from "./UserDropdown";

function Navbar() {
  const { user, isLoading } = useUser();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <PlayCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">The Xperience</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {user?.role === "ADMIN" ? (
            // Admin navigation - Using NEW routes with multi-course support
            <>
              <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/trainings" className="text-sm font-medium hover:text-primary transition-colors">
                Trainings
              </Link>
              <Link href="/admin/classes" className="text-sm font-medium hover:text-primary transition-colors">
                Classes
              </Link>
              <Link href="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">
                Users
              </Link>
              <Link href="/admin/analytics" className="text-sm font-medium hover:text-primary transition-colors">
                Analytics
              </Link>
            </>
          ) : (
            // Student navigation
            <>
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Trainings
              </Link>
              <Link href="/classes" className="text-sm font-medium hover:text-primary transition-colors">
                Classes
              </Link>
              <Link href="/feed" className="text-sm font-medium hover:text-primary transition-colors">
                Feed
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
                Leaderboard
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <UserDropdown user={user} />
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);
