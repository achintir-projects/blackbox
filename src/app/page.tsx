"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("create")

  const handleCreateWallet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get("name")
      const password = formData.get("password")

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          name,
          password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Wallet created successfully!")
        router.push("/tokens")
      } else {
        throw new Error(data.error || "Failed to create wallet")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create wallet")
    } finally {
      setLoading(false)
    }
  }

  const handleImportWallet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const privateKey = formData.get("privateKey")

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "import",
          privateKey,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Wallet imported successfully!")
        router.push("/tokens")
      } else {
        throw new Error(data.error || "Failed to import wallet")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import wallet")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center text-white">Welcome to Wallet dApp</CardTitle>
          <CardDescription className="text-center text-neutral-400">
            Create a new wallet or import an existing one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="create" className="text-sm">Create Wallet</TabsTrigger>
              <TabsTrigger value="import" className="text-sm">Import Wallet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateWallet} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-neutral-200">Wallet Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter wallet name"
                    required
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-neutral-200">Password (optional)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500"
                  />
                  <p className="text-xs text-neutral-500">
                    Password adds an extra layer of security to your wallet
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Wallet"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="import">
              <form onSubmit={handleImportWallet} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="privateKey" className="text-neutral-200">Private Key</Label>
                  <Input
                    id="privateKey"
                    name="privateKey"
                    placeholder="Enter your private key"
                    required
                    className="bg-neutral-800/50 border-neutral-700 text-white font-mono text-sm placeholder:text-neutral-500"
                  />
                  <p className="text-xs text-neutral-500">
                    Your private key is kept secure and never leaves your device
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={loading}
                >
                  {loading ? "Importing..." : "Import Wallet"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
