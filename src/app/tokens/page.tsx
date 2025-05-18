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
  'USDT': '/icons/usdt.svg',
  'BTC': '/icons/btc.svg',
  'ETH': '/icons/eth.svg',
  'BNB': '/icons/bnb.svg',
  'TRX': '/icons/trx.svg'
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">My Tokens</h1>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
          <div className="text-right bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-blue-700">
              ${totalPortfolioValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-300 hover:bg-blue-50 text-blue-600 font-medium">
                Add Token
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-gray-200 shadow-lg">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-gray-900">Add New Token</DialogTitle>
                <p className="text-sm text-gray-500">Enter the contract address of the token you want to add.</p>
              </DialogHeader>
              <form onSubmit={handleAddToken} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contractAddress" className="text-gray-700 font-medium">Contract Address</Label>
                  <Input 
                    id="contractAddress" 
                    placeholder="0x..." 
                    className="bg-white border-gray-300 h-12 text-gray-900 placeholder:text-gray-400" 
                  />
                  <p className="text-xs text-gray-500">The token contract address can be found on the blockchain explorer.</p>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium">
                  Add Token
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <Card 
            key={token.id}
            className="bg-white hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200 shadow-sm rounded-xl overflow-hidden"
            onClick={() => handleTokenClick(token.id)}
          >
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <div className="relative w-12 h-12 bg-white rounded-full overflow-hidden p-2 border border-gray-100">
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
                <p className="text-xl font-bold text-gray-900">
                  {parseFloat(token.balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8
                  })} {token.symbol}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  ${token.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} USD
                </p>
                <p className="text-sm text-blue-600 font-medium mt-2">
                  Value: ${(parseFloat(token.balance) * token.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} USD
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
