"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useUser } from "../hooks/useUser";
import UserDropdown from "./UserDropdown";
import { usePathname, useParams } from "next/navigation";

function Navbar() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const params = useParams();
  const [feedUrl, setFeedUrl] = useState("/feed");
  const [leaderboardUrl, setLeaderboardUrl] = useState("/leaderboard");

  useEffect(() => {
    // Check if we're on a training detail page
    const isTrainingPage = pathname?.startsWith("/courses/");
    if (isTrainingPage && params?.id) {
      const trainingId = params.id as string;
      
      // Try to get the selected class from localStorage
      const savedClassId = localStorage.getItem(`selectedClass_${trainingId}`);
      
      if (savedClassId) {
        setFeedUrl(`/feed?training=${trainingId}&class=${savedClassId}`);
        setLeaderboardUrl(`/leaderboard?training=${trainingId}&class=${savedClassId}`);
      } else {
        // Still include training context even without class
        setFeedUrl(`/feed?training=${trainingId}`);
        setLeaderboardUrl(`/leaderboard?training=${trainingId}`);
      }
    } else {
      // Reset to default URLs when not on a training page
      setFeedUrl("/feed");
      setLeaderboardUrl("/leaderboard");
    }
  }, [pathname, params]);

  // Check if we're on the homepage
  const isHomepage = pathname === "/";

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-200">
          <img 
            src="/logos/dark blue secondary logo.svg" 
            alt="XPERIENCE Logo" 
            className="h-10 w-25"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
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
            // Student navigation - hide on homepage
            !isHomepage ? (
              <>
                <Link href="/" className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Trainings
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href={feedUrl} className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Feed
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href={leaderboardUrl} className="text-sm font-medium hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Leaderboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0476D7] group-hover:w-full transition-all duration-200"></span>
                </Link>
              </>
            ) : null
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
