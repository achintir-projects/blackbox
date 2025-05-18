"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"

interface TokenDetails {
  id: string
  symbol: string
  name: string
  balance: string
  price: number
  isForced?: boolean
  icon: string
  transactions: {
    id: string
    type: 'send' | 'receive'
    amount: string
    date: string
    status: 'completed' | 'pending'
  }[]
}

// Mock data - replace with actual API call
const mockTokenDetails: TokenDetails = {
  id: "1",
  symbol: "USDT",
  name: "Tether USD",
  balance: "1000.00",
  price: 1.00,
  isForced: true,
  icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  transactions: [
    {
      id: "tx1",
      type: "receive",
      amount: "500.00",
      date: "2024-03-20",
      status: "completed"
    },
    {
      id: "tx2",
      type: "send",
      amount: "200.00",
      date: "2024-03-19",
      status: "completed"
    }
  ]
}

export default function TokenDetailsPage({ params }: { params: { tokenId: string } }) {
  const router = useRouter()
  const [token, setToken] = useState<TokenDetails>(mockTokenDetails)

  const handleSend = () => {
    router.push(`/tokens/${params.tokenId}/send`)
  }

  const handleReceive = () => {
    router.push(`/tokens/${params.tokenId}/receive`)
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        ← Back
      </Button>

      <Card className="bg-[#363b57] border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 bg-white rounded-full overflow-hidden">
                <Image
                  src={token.icon}
                  alt={`${token.symbol} icon`}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-2xl">{token.symbol}</h1>
                <p className="text-sm text-gray-400">{token.name}</p>
              </div>
            </div>
            {token.isForced && (
              <span className="text-xs bg-blue-500 px-2 py-1 rounded">Forced</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold">
              {token.balance} {token.symbol}
            </p>
            <p className="text-gray-400">
              ${(parseFloat(token.balance) * token.price).toLocaleString()} USD
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700" 
              onClick={handleSend}
            >
              Send
            </Button>
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={handleReceive}
            >
              Receive
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <div className="space-y-2">
              {token.transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-[#404663] hover:bg-[#454b6d] transition-colors"
                >
                  <div>
                    <p className="capitalize">{tx.type}</p>
                    <p className="text-sm text-gray-400">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={tx.type === 'receive' ? 'text-green-500' : 'text-red-500'}>
                      {tx.type === 'receive' ? '+' : '-'}{tx.amount} {token.symbol}
                    </p>
                    <p className="text-sm text-gray-400 capitalize">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
