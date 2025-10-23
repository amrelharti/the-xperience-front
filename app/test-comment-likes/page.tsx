"use client"

import { useState } from "react"
import { useUser } from "@/app/hooks/useUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Heart } from "lucide-react"

export default function TestCommentLikesPage() {
  const { user, isLoading } = useUser()
  const [testResult, setTestResult] = useState<string | null>(null)
  const { toast } = useToast()

  const testCommentLike = async () => {
    // Replace with an actual comment ID from your database for testing
    const testCommentId = "test-comment-id"; 
    if (!user) {
      setTestResult("❌ Not logged in. Please log in first.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/comments/${testCommentId}/like`, {
        method: "POST",
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json();
        setTestResult(`✅ Comment like toggled! Liked: ${data.liked}, Like Count: ${data.likeCount}`);
        toast({
          title: "Success",
          description: "Comment like test successful!",
        });
      } else {
        const errorData = await res.json();
        setTestResult(`❌ Comment like failed! Status: ${res.status}, Error: ${errorData.error || 'Unknown error'}`);
        toast({
          title: "Error",
          description: errorData.error || "Failed to test comment like",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing comment like:", error)
      setTestResult(`❌ Error testing comment like: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "Failed to test comment like",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Comment Like Test Page</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading user...</p>
          ) : user ? (
            <p>Logged in as: <span className="font-semibold">{user.name}</span> (Role: <span className="font-semibold">{user.role}</span>)</p>
          ) : (
            <p>Not logged in.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Comment Like Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            This will test the comment like functionality. Note: You need a valid comment ID for this to work.
          </p>
          <Button onClick={testCommentLike} disabled={!user} className="mb-4">
            <Heart className="h-4 w-4 mr-2" />
            Test Comment Like
          </Button>
          {testResult && <p className="mt-2">{testResult}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
