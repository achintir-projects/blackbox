"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { QRCodeCanvas } from "qrcode.react"

interface TokenInfo {
  symbol: string
  walletAddress: string
}

export default function ReceiveTokenPage({ params }: { params: { tokenId: string } }) {
  const router = useRouter()
  const [token, setToken] = useState<TokenInfo>({ symbol: "", walletAddress: "" })

  useEffect(() => {
    // In a real app, fetch wallet address from your backend
    setToken({
      symbol: "USDT",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    })
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token.walletAddress)
      toast.success("Address copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy address")
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
          <CardTitle>Receive {token.symbol}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeCanvas 
                value={token.walletAddress}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Your Wallet Address</p>
              <div className="p-4 bg-[#363b57] rounded-lg break-all font-mono text-sm">
                {token.walletAddress}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={copyToClipboard}
            >
              Copy Address
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-center text-gray-400">
              Send only {token.symbol} to this address.
            </p>
            <p className="text-sm text-center text-red-400">
              Sending any other tokens may result in permanent loss.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
