import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
    const codeId = params.id

    const response = await fetch(`${backendUrl}/api/admin/codes/${codeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || ""
      },
      credentials: "include"
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to delete access code:", error)
      return NextResponse.json(
        { error: "Failed to delete access code" },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting access code:", error)
    return NextResponse.json(
      { error: "Failed to delete access code" },
      { status: 500 }
    )
  }
}



