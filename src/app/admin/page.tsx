"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TokenInjection {
  id: number
  symbol: string
  amount: number
  price: number
  timestamp: string
  token: {
    id: number
    symbol: string
    name: string
    balance: number
    price: number
  }
}

const ADMIN_KEY = 'admin-secret' // In a real app, this would be stored securely

export default function AdminPage() {
  const [injections, setInjections] = useState<TokenInjection[]>([])
  const [loading, setLoading] = useState(false)
  const [injectFormData, setInjectFormData] = useState({
    walletAddress: "",
    symbol: "USDT",
    amount: "",
    price: ""
  })
  const [burnFormData, setBurnFormData] = useState({
    walletAddress: "",
    symbol: "USDT",
    amount: ""
  })

  useEffect(() => {
    fetchInjections()
  }, [])

  const fetchInjections = async () => {
    try {
      const response = await fetch(`/api/admin?adminKey=${ADMIN_KEY}`)
      const data = await response.json()
      if (data.success) {
        setInjections(data.data.injections)
      } else {
        toast.error("Failed to fetch injections")
      }
    } catch (error) {
      toast.error("Failed to fetch injections")
    }
  }

  const handleInjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'inject',
          adminKey: ADMIN_KEY,
          walletAddress: injectFormData.walletAddress,
          symbol: injectFormData.symbol,
          amount: parseFloat(injectFormData.amount),
          price: parseFloat(injectFormData.price)
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Token injection successful!")
        setInjectFormData({ walletAddress: "", symbol: "USDT", amount: "", price: "" })
        fetchInjections() // Refresh the list
      } else {
        toast.error(data.error || "Failed to inject tokens")
      }
    } catch (error) {
      toast.error("Failed to inject tokens. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBurnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'burn',
          adminKey: ADMIN_KEY,
          walletAddress: burnFormData.walletAddress,
          symbol: burnFormData.symbol,
          amount: parseFloat(burnFormData.amount)
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Token burn successful!")
        setBurnFormData({ walletAddress: "", symbol: "USDT", amount: "" })
        fetchInjections() // Refresh the list
      } else {
        toast.error(data.error || "Failed to burn tokens")
      }
    } catch (error) {
      toast.error("Failed to burn tokens. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 bg-white text-black">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <Card className="bg-white border border-gray-300">
        <CardHeader>
          <CardTitle>Inject Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInjectSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="walletAddressInject">Wallet Address</Label>
                <Input
                  id="walletAddressInject"
                  type="text"
                  placeholder="Enter wallet address"
                  value={injectFormData.walletAddress}
                  onChange={(e) => setInjectFormData(prev => ({
                    ...prev,
                    walletAddress: e.target.value
                  }))}
                  required
                  className="bg-gray-100 text-black"
                />
              </div>
              <div>
                <Label htmlFor="symbolInject">Token Symbol</Label>
                <Input
                  id="symbolInject"
                  value={injectFormData.symbol}
                  disabled
                  className="bg-gray-100 text-black"
                />
              </div>
              <div>
                <Label htmlFor="amountInject">Amount</Label>
                <Input
                  id="amountInject"
                  type="number"
                  placeholder="Enter amount"
                  value={injectFormData.amount}
                  onChange={(e) => setInjectFormData(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  required
                  className="bg-gray-100 text-black"
                />
              </div>
              <div>
                <Label htmlFor="priceInject">Force Price (USD)</Label>
                <Input
                  id="priceInject"
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={injectFormData.price}
                  onChange={(e) => setInjectFormData(prev => ({
                    ...prev,
                    price: e.target.value
                  }))}
                  required
                  className="bg-gray-100 text-black"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Inject Tokens"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-300">
        <CardHeader>
          <CardTitle>Burn Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBurnSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="walletAddressBurn">Wallet Address</Label>
                <Input
                  id="walletAddressBurn"
                  type="text"
                  placeholder="Enter wallet address"
                  value={burnFormData.walletAddress}
                  onChange={(e) => setBurnFormData(prev => ({
                    ...prev,
                    walletAddress: e.target.value
                  }))}
                  required
                  className="bg-gray-100 text-black"
                />
              </div>
              <div>
                <Label htmlFor="symbolBurn">Token Symbol</Label>
                <Input
                  id="symbolBurn"
                  value={burnFormData.symbol}
                  disabled
                  className="bg-gray-100 text-black"
                />
              </div>
              <div>
                <Label htmlFor="amountBurn">Amount</Label>
                <Input
                  id="amountBurn"
                  type="number"
                  placeholder="Enter amount"
                  value={burnFormData.amount}
                  onChange={(e) => setBurnFormData(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  required
                  className="bg-gray-100 text-black"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Burn Tokens"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-300">
        <CardHeader>
          <CardTitle>Recent Injections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {injections.map((injection) => (
                <TableRow key={injection.id}>
                  <TableCell>{new Date(injection.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{injection.symbol}</TableCell>
                  <TableCell>{injection.amount.toLocaleString()}</TableCell>
                  <TableCell>${injection.price.toFixed(2)}</TableCell>
                  <TableCell>${(injection.amount * injection.price).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}