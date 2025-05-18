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
  const [formData, setFormData] = useState({
    symbol: "USDT",
    amount: "",
    price: ""
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

  const handleSubmit = async (e: React.FormEvent) => {
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
          symbol: formData.symbol,
          amount: parseFloat(formData.amount),
          price: parseFloat(formData.price)
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Token injection successful!")
        setFormData({ symbol: "USDT", amount: "", price: "" })
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <Card className="bg-[#2b2f45] border-0">
        <CardHeader>
          <CardTitle>Inject Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="symbol">Token Symbol</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  disabled
                  className="bg-[#363b57]"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  required
                  className="bg-[#363b57]"
                />
              </div>
              <div>
                <Label htmlFor="price">Force Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    price: e.target.value
                  }))}
                  required
                  className="bg-[#363b57]"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Inject Tokens"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#2b2f45] border-0">
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
