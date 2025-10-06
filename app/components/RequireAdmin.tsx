"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [checked, setChecked] = useState(false)

	useEffect(() => {
		const check = async () => {
			try {
				console.log("RequireAdmin: Checking admin authentication...")
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me`, {
					credentials: "include",
				})
				console.log("RequireAdmin: /api/me response:", res.status, res.statusText)
				
				if (!res.ok) {
					console.log("RequireAdmin: Not authenticated, redirecting to landing page")
					router.replace("/")
					return
				}
				
				const user = await res.json()
				console.log("RequireAdmin: User data:", user)
				
				if (user.role !== "ADMIN") {
					console.log("RequireAdmin: User is not admin, redirecting to courses")
					router.replace("/courses")
					return
				}
				
				console.log("RequireAdmin: Admin authenticated, allowing access")
				setChecked(true)
			} catch (error) {
				console.log("RequireAdmin: Error checking admin auth:", error)
				router.replace("/")
			}
		}
		check()
	}, [router])

	if (!checked) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Checking admin access...</p>
				</div>
			</div>
		)
	}
	
	return <>{children}</>
}
