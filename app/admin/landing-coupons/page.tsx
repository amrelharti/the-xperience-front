"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import RequireAdmin from "@/app/components/RequireAdmin"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, BadgePercent, Calendar, Edit, Eye, Menu, Plus, Save, Trash2, X } from "lucide-react"

interface Coupon {
  id: string
  code: string
  discountLabel: string
  applicableOffer: string
  active: boolean
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  createdAt: string
}

interface LeadUsage {
  id: string
  fullName: string
  phone: string
  offer: string
  createdAt: string
  couponCode?: string
  couponDiscountLabel?: string
}

interface CouponFormState {
  code: string
  discountLabel: string
  applicableOffer: string
  active: boolean
  maxUses: string
  expiresAt: string
}

const initialForm: CouponFormState = {
  code: "",
  discountLabel: "",
  applicableOffer: "",
  active: true,
  maxUses: "",
  expiresAt: "",
}

const OFFER_OPTIONS = [
  "COACHING BASIC - 800 DH",
  "COACHING PREMIUM - 1199 DH",
]

export default function LandingCouponsPage() {
  const { user } = useUser()
  const { toast } = useToast()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null)
  const [form, setForm] = useState<CouponFormState>(initialForm)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null)

  const [showUsageDialog, setShowUsageDialog] = useState(false)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageCouponCode, setUsageCouponCode] = useState("")
  const [usages, setUsages] = useState<LeadUsage[]>([])

  useEffect(() => {
    loadCoupons()
  }, [])

  const totalUsages = useMemo(() => coupons.reduce((acc, item) => acc + (item.usedCount || 0), 0), [coupons])

  const loadCoupons = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/landing-page/coupons", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to load coupons")
      const data = await res.json()
      setCoupons(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading coupons:", error)
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEditingCouponId(null)
    setForm(initialForm)
  }

  const onEdit = (coupon: Coupon) => {
    setEditingCouponId(coupon.id)
    setForm({
      code: coupon.code,
      discountLabel: coupon.discountLabel,
      applicableOffer: coupon.applicableOffer,
      active: coupon.active,
      maxUses: coupon.maxUses == null ? "" : String(coupon.maxUses),
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : "",
    })
  }

  const buildPayload = () => ({
    code: form.code.trim().toUpperCase(),
    discountLabel: form.discountLabel.trim(),
    applicableOffer: form.applicableOffer.trim(),
    active: form.active,
    maxUses: form.maxUses.trim() === "" ? null : Number(form.maxUses),
    expiresAt: form.expiresAt.trim() === "" ? null : form.expiresAt.trim(),
  })

  const handleSave = async () => {
    if (!form.code.trim() || !form.discountLabel.trim() || !form.applicableOffer.trim()) {
      toast({
        title: "Missing fields",
        description: "Code, discount label and applicable offer are required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const payload = buildPayload()
      const isEdit = Boolean(editingCouponId)
      const endpoint = isEdit
        ? `/api/admin/landing-page/coupons/${editingCouponId}`
        : "/api/admin/landing-page/coupons"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} coupon`)
      }

      toast({
        title: "Success",
        description: isEdit ? "Coupon updated successfully." : "Coupon created successfully.",
      })
      resetForm()
      await loadCoupons()
    } catch (error) {
      console.error("Error saving coupon:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save coupon",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const openDelete = (coupon: Coupon) => {
    setCouponToDelete(coupon)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!couponToDelete) return
    try {
      const res = await fetch(`/api/admin/landing-page/coupons/${couponToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to delete coupon")
      toast({ title: "Success", description: "Coupon deleted successfully." })
      setShowDeleteDialog(false)
      setCouponToDelete(null)
      await loadCoupons()
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      })
    }
  }

  const openUsages = async (couponCode: string) => {
    try {
      setShowUsageDialog(true)
      setUsageCouponCode(couponCode)
      setUsageLoading(true)
      const res = await fetch(`/api/admin/landing-page/coupons/${encodeURIComponent(couponCode)}/usages`, {
        credentials: "include",
      })
      const data = await res.json().catch(() => [])
      setUsages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading coupon usages:", error)
      setUsages([])
    } finally {
      setUsageLoading(false)
    }
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img
                  src="/logos/dark blue secondary logo.svg"
                  alt="XPERIENCE Logo"
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
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

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/leads">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Leads
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <BadgePercent className="w-8 h-8 text-[#005eb8]" />
                  Landing Page Coupons
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Create and monitor coupon reductions for landing offers.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Total Coupons</p>
                <p className="text-3xl font-bold text-[#005eb8] mt-1">{coupons.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Total Coupon Uses</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{totalUsages}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">Active Coupons</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{coupons.filter((c) => c.active).length}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>{editingCouponId ? "Edit Coupon" : "Create Coupon"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  placeholder="Code (e.g., XPRO20)"
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
                <Input
                  placeholder="Discount label (e.g., 20%)"
                  value={form.discountLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, discountLabel: e.target.value }))}
                />
                <select
                  value={form.applicableOffer}
                  onChange={(e) => setForm((prev) => ({ ...prev, applicableOffer: e.target.value }))}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select applicable offer</option>
                  {OFFER_OPTIONS.map((offer) => (
                    <option key={offer} value={offer}>
                      {offer}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max uses (optional)"
                  value={form.maxUses}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxUses: e.target.value }))}
                />
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  />
                  Active
                </label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="bg-[#005eb8] hover:bg-[#0476D7] text-white">
                  {editingCouponId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isSaving ? "Saving..." : editingCouponId ? "Update Coupon" : "Create Coupon"}
                </Button>
                {editingCouponId && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-10 text-slate-600">Loading coupons...</div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-10 text-slate-600">No coupons yet.</div>
              ) : (
                <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">
                          {coupon.code} - {coupon.discountLabel}
                        </p>
                        <p className="text-sm text-slate-600">Offer: {coupon.applicableOffer}</p>
                        <p className="text-sm text-slate-600">
                          Uses: {coupon.usedCount}
                          {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ""}
                          {" - "}
                          {coupon.active ? "Active" : "Inactive"}
                        </p>
                        {coupon.expiresAt && (
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Expires: {new Date(coupon.expiresAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openUsages(coupon.code)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Usages
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onEdit(coupon)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDelete(coupon)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Coupon</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete coupon <strong>{couponToDelete?.code}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Coupon Usages - {usageCouponCode}</DialogTitle>
              <DialogDescription>Users/leads that submitted this coupon.</DialogDescription>
            </DialogHeader>
            {usageLoading ? (
              <div className="py-8 text-center text-slate-600">Loading usages...</div>
            ) : usages.length === 0 ? (
              <div className="py-8 text-center text-slate-600">No usages found.</div>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {usages.map((lead) => (
                  <div key={lead.id} className="rounded-md border border-slate-200 p-3">
                    <p className="font-medium text-slate-900">{lead.fullName}</p>
                    <p className="text-sm text-slate-600">{lead.phone}</p>
                    <p className="text-sm text-slate-600">Offer: {lead.offer}</p>
                    <p className="text-sm text-slate-600">Submitted: {new Date(lead.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUsageDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAdmin>
  )
}
