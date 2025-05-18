"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateWalletPage() {
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const createWallet = async () => {
    try {
      setIsCreating(true)
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create wallet")
      }

      const data = await response.json()
      if (data.success) {
        router.push("/tokens")
      }
    } catch (error) {
      console.error("Error creating wallet:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Your Wallet</CardTitle>
          <CardDescription>
            Get started with your crypto wallet to send and receive tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Wallet</Label>
              <p className="text-sm text-gray-500">
                A new wallet will be created for you automatically
              </p>
            </div>
            <Button
              className="w-full"
              onClick={createWallet}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Wallet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
