"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [checked, setChecked] = useState(false)

	useEffect(() => {
		const check = async () => {
			try {
				console.log("RequireAuth: Checking authentication...")
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me`, {
					credentials: "include",
				})
				console.log("RequireAuth: /api/me response:", res.status, res.statusText)
				if (!res.ok) {
					console.log("RequireAuth: Not authenticated, redirecting to landing page")
					router.replace("/")
					return
				}
				console.log("RequireAuth: Authenticated, allowing access")
				setChecked(true)
			} catch (error) {
				console.log("RequireAuth: Error checking auth:", error)
				router.replace("/")
			}
		}
		check()
	}, [router])

	if (!checked) return null
	return <>{children}</>
}



