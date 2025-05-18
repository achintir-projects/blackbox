"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"

interface TokenDetails {
  id: number
  symbol: string
  name: string
  balance: number
  price: number
  isForced: boolean
  transactions: {
    id: number
    type: 'send' | 'receive'
    amount: number
    createdAt: string
    status: 'completed' | 'pending' | 'failed'
    wallet: {
      address: string
    }
  }[]
}

const tokenIcons: Record<string, string> = {
  'USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
  'TRON': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/trx.png',
  'BTC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png',
  'BNB': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png',
  'SOL': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png',
  'XRP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xrp.png'
}

export default function TokenDetailsPage({ params }: { params: { tokenId: string } }) {
  const router = useRouter()
  const [token, setToken] = useState<TokenDetails | null>(null)

  useEffect(() => {
    fetchTokenDetails()
  }, [params.tokenId])

  const fetchTokenDetails = async () => {
    try {
      const [tokenResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/tokens/${params.tokenId}`),
        fetch(`/api/tokens/${params.tokenId}/send`)
      ])

      const tokenData = await tokenResponse.json()
      const transactionsData = await transactionsResponse.json()

      if (tokenData.success && transactionsData.success) {
        setToken({
          ...tokenData.data,
          transactions: transactionsData.data
        })
      }
    } catch (error) {
      console.error('Failed to fetch token details:', error)
    }
  }

  const handleSend = () => {
    router.push(`/tokens/${params.tokenId}/send`)
  }

  const handleReceive = () => {
    router.push(`/tokens/${params.tokenId}/receive`)
  }

  if (!token) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-4"
      >
        Back
      </Button>

      <Card className="bg-[#2b2f45] border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 bg-white rounded-full overflow-hidden">
                <Image
                  src={tokenIcons[token.symbol] || tokenIcons['USDT']}
                  alt={`${token.symbol} icon`}
                  fill
                  sizes="48px"
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
              {token.balance.toLocaleString()} {token.symbol}
            </p>
            <p className="text-gray-400">
              ${(token.balance * token.price).toLocaleString()} USD
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
                  className="flex justify-between items-center p-3 rounded-lg bg-[#363b57] hover:bg-[#404663] transition-colors"
                >
                  <div>
                    <p className="capitalize">{tx.type}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={tx.type === 'receive' ? 'text-green-500' : 'text-red-500'}>
                      {tx.type === 'receive' ? '+' : '-'}{tx.amount.toLocaleString()} {token.symbol}
                    </p>
                    <p className="text-sm text-gray-400 font-mono">
                      {tx.wallet.address.slice(0, 6)}...{tx.wallet.address.slice(-4)}
                    </p>
                  </div>
                </div>
              ))}
              {token.transactions.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
