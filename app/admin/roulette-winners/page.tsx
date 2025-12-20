"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Menu, X, Trophy, ArrowLeft, Calendar, Gift, Key } from "lucide-react"

interface RouletteWinner {
  id: string
  prize: string
  prizeIndex: number
  verificationCode: string
  userIdentifier: string
  winnerName: string | null
  winDate: string
  createdAt: string
}

export default function RouletteWinnersPage() {
  const [winners, setWinners] = useState<RouletteWinner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    loadWinners()
  }, [])

  const loadWinners = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/roulette/winners`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setWinners(data)
        console.log("🎰 Loaded", data.length, "roulette winners")
      } else {
        throw new Error("Failed to load winners")
      }
    } catch (error) {
      console.error("Error loading winners:", error)
      toast({
        title: "Error",
        description: "Failed to load roulette winners",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPrizeColor = (prize: string) => {
    if (prize.includes("20% OFF")) {
      return "from-yellow-500 to-yellow-600"
    } else if (prize.includes("Free CV")) {
      return "from-green-500 to-green-600"
    } else {
      return "from-red-500 to-red-600"
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this winner?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/roulette/winners/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      if (res.ok) {
        toast({
          title: "Success",
          description: "Winner deleted successfully",
        })
        loadWinners()
      } else {
        throw new Error("Failed to delete winner")
      }
    } catch (error) {
      console.error("Error deleting winner:", error)
      toast({
        title: "Error",
        description: "Failed to delete winner",
        variant: "destructive",
      })
    }
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
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
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
                <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <UserDropdown user={user} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-[#0476D7] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b bg-white/95 backdrop-blur-md">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0476D7] hover:bg-slate-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Roulette Winners
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  View all roulette winners and their verification codes
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Winners</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{winners.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winners List */}
          {isLoading ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                  <p className="mt-4 text-slate-600">Loading winners...</p>
                </div>
              </CardContent>
            </Card>
          ) : winners.length === 0 ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No winners yet</h3>
                  <p className="text-slate-600">Roulette winners will appear here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {winners.map((winner, index) => (
                <Card
                  key={winner.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Winner Name */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">{winner.winnerName || "N/A"}</p>
                        </div>
                      </div>

                      {/* Prize */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 bg-gradient-to-br ${getPrizeColor(winner.prize)} rounded-lg`}>
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Prize</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">{winner.prize}</p>
                        </div>
                      </div>

                      {/* Verification Code */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                          <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Verification Code</p>
                          <p className="text-base font-mono font-bold text-indigo-600 mt-1">{winner.verificationCode}</p>
                        </div>
                      </div>

                      {/* Win Date */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Win Date</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">{formatDate(winner.createdAt)}</p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="flex items-center justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(winner.id)}
                          className="hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </RequireAdmin>
  )
}

