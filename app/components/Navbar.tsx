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
        <Link href="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-200">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0476D7] to-[#0068A7] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
            <img 
              src="/logos/white logomark.svg" 
              alt="XPERIENCE Logo" 
              className="h-6 w-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.innerHTML = 'X';
                  fallback.className = 'text-white font-black text-xl';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          <span className="font-bold text-xl font-[family-name:var(--font-montserrat)] tracking-tight text-[#333333]">XPERIENCE</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {user?.role === "ADMIN" ? (
            // Admin navigation - Using NEW routes with multi-course support
            <>
              <Link href="/admin" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/admin/trainings" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Trainings
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/admin/classes" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Classes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/admin/users" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Users
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/admin/analytics" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Analytics
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
              </Link>
            </>
          ) : (
            // Student navigation
            <>
              <Link href="/" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Trainings
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/classes" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Classes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/feed" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Feed
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Leaderboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
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
