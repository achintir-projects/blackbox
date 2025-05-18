"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

interface TokenInfo {
  symbol: string
  balance: string
}

export default function SendTokenPage({ params }: { params: { tokenId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<TokenInfo>({ symbol: "", balance: "0" })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    address: "",
    amount: ""
  })

  useEffect(() => {
    // Fetch token details
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/tokens/${params.tokenId}`)
        const data = await response.json()
        if (data.success) {
          setToken(data.data)
        }
      } catch (error) {
        console.error('Error fetching token:', error)
      }
    }

    fetchToken()
  }, [params.tokenId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate amount
    const amount = parseFloat(formData.amount)
    const balance = parseFloat(token.balance)
    
    if (amount > balance) {
      toast.error("Insufficient balance")
      return
    }
    
    setShowConfirmation(true)
  }

  const handleConfirmSend = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tokens/${params.tokenId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Transaction submitted successfully!")
        router.push(`/tokens/${params.tokenId}`)
      } else {
        throw new Error(data.error || "Transaction failed")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transaction failed")
      setLoading(false)
      setShowConfirmation(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        ← Back
      </Button>

      <Card className="bg-[#2b2f45] border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Send {token.symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">Recipient Address</Label>
              <Input
                id="address"
                placeholder="Enter recipient's wallet address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: e.target.value
                }))}
                className="bg-[#363b57] border-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  className="bg-[#363b57] border-0 pr-16"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  {token.symbol}
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Available: {token.balance} {token.symbol}
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              Review Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-[#2b2f45] border-0">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please review the transaction details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">To:</span>
              <span className="text-sm font-mono">{formData.address}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount:</span>
              <span>{formData.amount} {token.symbol}</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSend}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Sending..." : "Confirm Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
