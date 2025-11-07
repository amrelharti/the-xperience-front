"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [checked, setChecked] = useState(false)

	useEffect(() => {
		const check = async () => {
			try {
				
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me`, {
					credentials: "include",
				})
				
				
				if (!res.ok) {
					
					router.replace("/")
					return
				}
				
				const user = await res.json()
				
				
				if (user.role !== "ADMIN") {
					
					router.replace("/courses")
					return
				}
				
				
				setChecked(true)
			} catch (error) {
				
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
