"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
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
				
				setChecked(true)
			} catch (error) {
				
				router.replace("/")
			}
		}
		check()
	}, [router])

	if (!checked) return null
	return <>{children}</>
}



