"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export default function CreateWalletPage() {
  const [walletName, setWalletName] = useState("")
  const [password, setPassword] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState("")
  const [privateKeyDisplay, setPrivateKeyDisplay] = useState("")
  const router = useRouter()

  const createWallet = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!walletName.trim()) {
      setError("Wallet name is required")
      return
    }
    setError("")
    setIsCreating(true)
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", walletName, password }),
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('walletAddress', data.data.address)
        setPrivateKeyDisplay(data.data.privateKey)
        // Await signIn after setting privateKeyDisplay to ensure wallet creation completes
        await signIn("credentials", { address: data.data.address, redirect: false })
      } else {
        setError(data.error || "Failed to create wallet")
      }
    } catch (err) {
      setError("Failed to create wallet")
    } finally {
      setIsCreating(false)
    }
  }

  const importWallet = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!privateKey.trim()) {
      setError("Private key is required for import")
      return
    }
    setError("")
    setIsImporting(true)
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", privateKey }),
      })
      const data = await response.json()
      if (data.success) {
        await signIn("credentials", { address: data.data.address, redirect: false })
        router.push("/tokens")
      } else {
        setError(data.error || "Failed to import wallet")
      }
    } catch (err) {
      setError("Failed to import wallet")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-10 space-y-8">
      {!privateKeyDisplay ? (
        <>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create Your Wallet</CardTitle>
              <CardDescription>Enter a name and optional password to create a new wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="walletName">Wallet Name</Label>
                <Input
                  id="walletName"
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Enter wallet name"
                  disabled={isCreating || isImporting}
                />
              </div>
              <div>
                <Label htmlFor="password">Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isCreating || isImporting}
                />
              </div>
              <Button onClick={createWallet} disabled={isCreating || isImporting} className="w-full">
                {isCreating ? "Creating..." : "Create Wallet"}
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Import Wallet</CardTitle>
              <CardDescription>Import an existing wallet using your private key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="privateKey">Private Key</Label>
                <Input
                  id="privateKey"
                  type="text"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter private key"
                  disabled={isCreating || isImporting}
                />
              </div>
              <Button onClick={importWallet} disabled={isCreating || isImporting} className="w-full">
                {isImporting ? "Importing..." : "Import Wallet"}
              </Button>
            </CardContent>
          </Card>

          {error && <p className="text-red-600">{error}</p>}
        </>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Wallet Created</CardTitle>
            <CardDescription>Your private key is shown below. Please copy and store it securely.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="break-all p-4 bg-gray-100 rounded">{privateKeyDisplay}</div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(privateKeyDisplay)
              }}
              className="w-full"
            >
              Copy Private Key
            </Button>
            <Button
              onClick={() => {
                setPrivateKeyDisplay("")
                router.push("/tokens")
              }}
              className="w-full"
            >
              Proceed to Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
