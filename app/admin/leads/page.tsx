"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Menu, X, MessageSquare, ArrowLeft, Phone, User, Calendar, Briefcase, Tag, Trash2, BadgePercent } from "lucide-react"

interface LandingPageLead {
  id: string
  fullName: string
  phone: string
  lookingFor: string
  offer: string
  couponCode?: string
  couponDiscountLabel?: string
  createdAt: string
}

export default function LandingPageLeadsPage() {
  const [leads, setLeads] = useState<LandingPageLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<LandingPageLead | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/landing-page/leads`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        // Data is already sorted by createdAt desc from backend
        setLeads(data)
        console.log("📊 Loaded", data.length, "landing page leads")
      } else {
        throw new Error("Failed to load leads")
      }
    } catch (error) {
      console.error("Error loading leads:", error)
      toast({
        title: "Error",
        description: "Failed to load landing page leads",
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

  const getLookingForLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      stagePFE: "Stage PFE",
      premierEmploi: "Premier Emploi",
      progresserCarriere: "Progresser ma carrière",
      reconversion: "Reconversion Professionnelle",
    }
    return labels[value] || value
  }

  const handleDeleteClick = (lead: LandingPageLead) => {
    setLeadToDelete(lead)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/landing-page/leads/${leadToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Lead deleted successfully",
        })
        // Remove the lead from the list
        setLeads(leads.filter((lead) => lead.id !== leadToDelete.id))
      } else {
        const error = await res.json().catch(() => ({ error: "Failed to delete lead" }))
        toast({
          title: "Error",
          description: error.error || "Failed to delete lead",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting lead:", error)
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setLeadToDelete(null)
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
                  <MessageSquare className="w-8 h-8 text-rose-500" />
                  Landing Page Leads
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  View and manage leads from the landing page form
                </p>
              </div>
            </div>
            <Link href="/admin/landing-coupons">
              <Button variant="outline" className="border-[#005eb8] text-[#005eb8] hover:bg-blue-50">
                <BadgePercent className="w-4 h-4 mr-2" />
                Manage Coupons
              </Button>
            </Link>
          </div>

          {/* Stats Card */}
          <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Leads</p>
                  <p className="text-3xl font-bold text-rose-600 mt-1">{leads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads List */}
          {isLoading ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                  <p className="mt-4 text-slate-600">Loading leads...</p>
                </div>
              </CardContent>
            </Card>
          ) : leads.length === 0 ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads yet</h3>
                  <p className="text-slate-600">Leads from the landing page form will appear here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leads.map((lead, index) => (
                <Card
                  key={lead.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Full Name */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">{lead.fullName}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</p>
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-base font-semibold text-slate-900 mt-1 hover:text-blue-600 transition-colors"
                          >
                            {lead.phone}
                          </a>
                        </div>
                      </div>

                      {/* Looking For */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Looking For</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">
                            {getLookingForLabel(lead.lookingFor)}
                          </p>
                        </div>
                      </div>

                      {/* Offer */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg">
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Offer</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">{lead.offer}</p>
                        </div>
                      </div>

                      {/* Coupon */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Coupon</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">
                            {lead.couponCode
                              ? `${lead.couponCode}${lead.couponDiscountLabel ? ` (${lead.couponDiscountLabel})` : ""}`
                              : "None"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date and Actions */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted on {formatDate(lead.createdAt)}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(lead)}
                        className="hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the lead for <strong>{leadToDelete?.fullName}</strong>? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDeleteDialogOpen(false)
                    setLeadToDelete(null)
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </RequireAdmin>
  )
}

