"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface Transaction {
  id: number
  type: 'send' | 'receive'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
  wallet: {
    address: string
  }
  token: {
    symbol: string
    name: string
  }
}

export default function SendPage({ params }: { params: { tokenId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [formData, setFormData] = useState({
    recipient: "",
    amount: ""
  })

  const fetchTransactions = async () => {
    try {
      const { tokenId } = await params
      const response = await fetch(`/api/tokens/${tokenId}/send`)
      const data = await response.json()
      if (data.success) {
        setTransactions(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { tokenId } = await params
      const response = await fetch(`/api/tokens/${tokenId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: formData.recipient,
          amount: parseFloat(formData.amount)
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Transfer successful!")
        setFormData({ recipient: "", amount: "" })
        fetchTransactions()
        router.refresh() // Refresh page to update balances
      } else {
        toast.error(data.error || "Transfer failed")
      }
    } catch (error) {
      toast.error("Transfer failed. Please try again.")
    } finally {
      setLoading(false)
    }
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
          <CardTitle>Send Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient's wallet address"
                  value={formData.recipient}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recipient: e.target.value
                  }))}
                  required
                  className="bg-[#363b57]"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  placeholder="Enter amount to send"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  required
                  className="bg-[#363b57]"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Send"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#2b2f45] border-0">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{tx.type}</TableCell>
                  <TableCell>{tx.amount.toLocaleString()} {tx.token.symbol}</TableCell>
                  <TableCell className="capitalize">{tx.status}</TableCell>
                  <TableCell className="font-mono">
                    {tx.wallet.address.slice(0, 6)}...{tx.wallet.address.slice(-4)}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No transactions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
