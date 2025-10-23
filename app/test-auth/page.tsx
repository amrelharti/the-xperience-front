"use client"

import { useUser } from "@/app/hooks/useUser"
import { useEffect, useState } from "react"

export default function TestAuthPage() {
  const { user, isLoading } = useUser()
  const [testResult, setTestResult] = useState<string>("")

  const testAuth = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me`, {
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        setTestResult(`✅ Authentication working! User: ${data.name}`)
      } else {
        setTestResult(`❌ Authentication failed! Status: ${res.status}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`)
    }
  }

  const testComment = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/de68b8d6-9739-493a-82d0-fbafa067776f/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          content: "Test comment"
        })
      })
      
      if (res.ok) {
        setTestResult(`✅ Comment creation working!`)
      } else {
        setTestResult(`❌ Comment creation failed! Status: ${res.status}`)
      }
    } catch (error) {
      setTestResult(`❌ Comment error: ${error}`)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-4">
        <p><strong>User Status:</strong> {user ? `Logged in as ${user.name}` : "Not logged in"}</p>
        <p><strong>User Role:</strong> {user?.role || "N/A"}</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={testAuth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Authentication
        </button>
        
        <button 
          onClick={testComment}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Comment Creation
        </button>
      </div>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>{testResult}</p>
        </div>
      )}
    </div>
  )
}
