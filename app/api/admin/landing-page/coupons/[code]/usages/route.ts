import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

function buildAuthHeaders(cookieHeader: string) {
  let jwtToken: string | null = null
  if (cookieHeader) {
    const cookies = cookieHeader.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "SESSION" && value) {
        jwtToken = value
        break
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (jwtToken) {
    headers.Authorization = `Bearer ${jwtToken}`
  } else {
    headers.Cookie = cookieHeader
  }

  return headers
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const cookieHeader = request.headers.get("cookie") || ""
    const response = await fetch(`${BACKEND_URL}/api/admin/landing-page/coupons/${encodeURIComponent(code)}/usages`, {
      method: "GET",
      headers: buildAuthHeaders(cookieHeader),
      credentials: "include",
    })

    const data = await response.json().catch(() => ({ error: "Failed to fetch coupon usages" }))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
