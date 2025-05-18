"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Token {
  id: string
  symbol: string
  name: string
  balance: string
  price: number
  isForced?: boolean
  icon: string
}

const defaultTokens: Token[] = [
  { 
    id: "1", 
    symbol: "USDT", 
    name: "Tether USD", 
    balance: "0.00", 
    price: 1.00, 
    icon: "https://cryptologos.cc/logos/tether-usdt-logo.png"
  },
  { 
    id: "2", 
    symbol: "TRON", 
    name: "TRON USDT", 
    balance: "0.00", 
    price: 1.00,
    icon: "https://cryptologos.cc/logos/tron-trx-logo.png"
  },
  { 
    id: "3", 
    symbol: "BTC", 
    name: "Bitcoin", 
    balance: "0.00", 
    price: 45000.00,
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
  },
  { 
    id: "4", 
    symbol: "BNB", 
    name: "Binance Coin", 
    balance: "0.00", 
    price: 300.00,
    icon: "https://cryptologos.cc/logos/bnb-bnb-logo.png"
  },
  { 
    id: "5", 
    symbol: "SOL", 
    name: "Solana", 
    balance: "0.00", 
    price: 100.00,
    icon: "https://cryptologos.cc/logos/solana-sol-logo.png"
  },
  { 
    id: "6", 
    symbol: "XRP", 
    name: "Ripple", 
    balance: "0.00", 
    price: 0.50,
    icon: "https://cryptologos.cc/logos/xrp-xrp-logo.png"
  }
]

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)
  const [isAddingToken, setIsAddingToken] = useState(false)
  const router = useRouter()

  const handleTokenClick = (tokenId: string) => {
    router.push(`/tokens/${tokenId}`)
  }

  const handleAddToken = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingToken(false)
    // TODO: Implement token addition logic
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Tokens</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Add Token</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#363b57]">
            <DialogHeader>
              <DialogTitle>Add New Token</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddToken} className="space-y-4">
              <div>
                <Label htmlFor="contractAddress">Contract Address</Label>
                <Input id="contractAddress" placeholder="Enter token contract address" className="bg-[#404663]" />
              </div>
              <Button type="submit" className="w-full">
                Add Token
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <Card 
            key={token.id}
            className="bg-[#363b57] hover:bg-[#404663] transition-colors cursor-pointer border-0"
            onClick={() => handleTokenClick(token.id)}
          >
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <div className="relative w-10 h-10 bg-white rounded-full overflow-hidden">
                <Image
                  src={token.icon}
                  alt={`${token.symbol} icon`}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="flex justify-between items-center">
                  <span>{token.symbol}</span>
                  {token.isForced && (
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded">Forced</span>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-400">{token.name}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-lg font-bold">{token.balance} {token.symbol}</p>
                <p className="text-sm text-gray-400">
                  ${token.price.toLocaleString()} USD
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
