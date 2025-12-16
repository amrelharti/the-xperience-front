"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircle, Menu, X } from "lucide-react";
import { useUser } from "../hooks/useUser";
import UserDropdown from "./UserDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { usePathname, useParams, useSearchParams } from "next/navigation";

function Navbar() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [feedUrl, setFeedUrl] = useState("/feed");
  const [leaderboardUrl, setLeaderboardUrl] = useState("/leaderboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get current URL parameters
    const currentTraining = searchParams.get('training');
    const currentClass = searchParams.get('class');
    
    // Check if we're on a training detail page
    const isTrainingPage = pathname?.startsWith("/courses/");
    
    // Check if we're on a feed or leaderboard page
    const isFeedPage = pathname === "/feed";
    const isLeaderboardPage = pathname === "/leaderboard";
    
    if (isTrainingPage && params?.id) {
      // We're on a training detail page
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
    } else if (currentTraining) {
      // We're on a page with training parameters (feed, leaderboard, post detail, etc.)
      if (currentClass) {
        const feedUrlWithParams = `/feed?training=${currentTraining}&class=${currentClass}`;
        const leaderboardUrlWithParams = `/leaderboard?training=${currentTraining}&class=${currentClass}`;
        
        setFeedUrl(feedUrlWithParams);
        setLeaderboardUrl(leaderboardUrlWithParams);
        
        // Store feed context in localStorage when on feed/leaderboard pages
        if (isFeedPage || isLeaderboardPage) {
          localStorage.setItem('lastFeedContext', JSON.stringify({
            training: currentTraining,
            class: currentClass
          }));
        }
      } else {
        const feedUrlWithParams = `/feed?training=${currentTraining}`;
        const leaderboardUrlWithParams = `/leaderboard?training=${currentTraining}`;
        
        setFeedUrl(feedUrlWithParams);
        setLeaderboardUrl(leaderboardUrlWithParams);
        
        // Store feed context in localStorage when on feed/leaderboard pages
        if (isFeedPage || isLeaderboardPage) {
          localStorage.setItem('lastFeedContext', JSON.stringify({
            training: currentTraining,
            class: null
          }));
        }
      }
    } else {
      // No training params in current URL - check localStorage for last known context
      try {
        const savedContext = localStorage.getItem('lastFeedContext');
        if (savedContext) {
          const context = JSON.parse(savedContext);
          if (context.training) {
            if (context.class) {
              setFeedUrl(`/feed?training=${context.training}&class=${context.class}`);
              setLeaderboardUrl(`/leaderboard?training=${context.training}&class=${context.class}`);
            } else {
              setFeedUrl(`/feed?training=${context.training}`);
              setLeaderboardUrl(`/leaderboard?training=${context.training}`);
            }
          } else {
            // No saved context, use defaults
            setFeedUrl("/feed");
            setLeaderboardUrl("/leaderboard");
          }
        } else {
          // No saved context, use defaults
          setFeedUrl("/feed");
          setLeaderboardUrl("/leaderboard");
        }
      } catch (error) {
        // If localStorage parsing fails, use defaults
        console.error('Error reading feed context from localStorage:', error);
        setFeedUrl("/feed");
        setLeaderboardUrl("/leaderboard");
      }
    }
  }, [pathname, params, searchParams]);

  // Check if we're on the homepage
  const isHomepage = pathname === "/";

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity duration-200">
          <img 
            src="/logos/dark blue secondary logo.svg" 
            alt="XPERIENCE Logo" 
            className="h-8 sm:h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
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
            // Student navigation - only show for authenticated users, hide on homepage
            user && !isHomepage ? (
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

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <>
                <NotificationDropdown />
                <UserDropdown user={user} />
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/98 backdrop-blur-lg animate-in slide-in-from-top-5 duration-200">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {user?.role === "ADMIN" ? (
              <>
                <Link 
                  href="/admin" 
                  className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/trainings" 
                  className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  Trainings
                </Link>
                <Link 
                  href="/admin/classes" 
                  className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  Classes
                </Link>
                <Link 
                  href="/admin/users" 
                  className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  Users
                </Link>
                <Link 
                  href="/admin/analytics" 
                  className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  Analytics
                </Link>
              </>
            ) : (
              // Student navigation - only show for authenticated users, hide on homepage
              user && !isHomepage && (
                <>
                  <Link 
                    href="/" 
                    className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                  >
                    Trainings
                  </Link>
                  <Link 
                    href={feedUrl} 
                    className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                  >
                    Feed
                  </Link>
                  <Link 
                    href={leaderboardUrl} 
                    className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                  >
                    Leaderboard
                  </Link>
                </>
              )
            )}
            
            {/* Mobile User Section */}
            <div className="pt-4 border-t mt-4">
              {isLoading ? (
                <div className="px-4 py-3">
                  <div className="w-full h-10 rounded-lg bg-muted animate-pulse" />
                </div>
              ) : user ? (
                <div className="px-4 py-2 flex items-center gap-3">
                  <NotificationDropdown />
                  <div className="flex-1">
                    <UserDropdown user={user} />
                  </div>
                </div>
              ) : (
                <div className="px-4">
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default memo(Navbar);
