"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TokenInjection {
  id: string
  symbol: string
  amount: string
  price: string
  timestamp: string
}

// Mock data - replace with actual API data
const mockInjections: TokenInjection[] = [
  {
    id: "1",
    symbol: "USDT",
    amount: "10000",
    price: "1.00",
    timestamp: "2024-03-20 14:30:00"
  }
]

export default function AdminPage() {
  const [injections, setInjections] = useState<TokenInjection[]>(mockInjections)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    symbol: "USDT",
    amount: "",
    price: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement actual token injection logic
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay

      const newInjection: TokenInjection = {
        id: Date.now().toString(),
        symbol: formData.symbol,
        amount: formData.amount,
        price: formData.price,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }

      setInjections(prev => [newInjection, ...prev])
      setFormData({ symbol: "USDT", amount: "", price: "" })
      toast.success("Token injection successful!")
    } catch (error) {
      toast.error("Failed to inject tokens. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <Card className="bg-[#2b2f45]">
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
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Inject Tokens"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#2b2f45]">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {injections.map((injection) => (
                <TableRow key={injection.id}>
                  <TableCell>{injection.timestamp}</TableCell>
                  <TableCell>{injection.symbol}</TableCell>
                  <TableCell>{injection.amount}</TableCell>
                  <TableCell>${injection.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
