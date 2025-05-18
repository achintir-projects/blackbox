"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
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

const tokenIcons: Record<string, string> = {
  'USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
  'TRON': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/trx.png',
  'BTC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png',
  'BNB': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png',
  'SOL': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png',
  'XRP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xrp.png'
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isAddingToken, setIsAddingToken] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Fetch tokens from the API
    const fetchTokens = async () => {
      try {
        const response = await fetch('/api/tokens')
        const data = await response.json()
        if (data.success) {
          // Add icons to tokens
          const tokensWithIcons = data.data.map((token: Token) => ({
            ...token,
            icon: tokenIcons[token.symbol] || tokenIcons['USDT'] // fallback to USDT icon
          }))
          setTokens(tokensWithIcons)
        }
      } catch (error) {
        console.error('Error fetching tokens:', error)
      }
    }

    fetchTokens()
  }, [])

  const handleTokenClick = (tokenId: string) => {
    router.push(`/tokens/${tokenId}`)
  }

  const handleAddToken = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingToken(false)
    // TODO: Implement token addition logic
  }

  // Calculate total portfolio value
  const totalPortfolioValue = tokens.reduce((acc, token) => {
    return acc + (parseFloat(token.balance) * token.price)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">My Tokens</h1>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Portfolio Value</p>
            <p className="text-2xl font-bold">${totalPortfolioValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</p>
          </div>
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
                  sizes="(max-width: 768px) 40px, 40px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="flex justify-between items-center">
                  <span>{token.symbol}</span>
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
                <p className="text-sm text-gray-400">
                  Value: ${(parseFloat(token.balance) * token.price).toLocaleString()} USD
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
