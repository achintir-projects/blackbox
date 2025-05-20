"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
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
      const { tokenId } = params
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
      const { tokenId } = params
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
        className="mb-4 border-gray-200 hover:bg-gray-50 text-gray-700"
      >
        Back
      </Button>

      <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Send Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-gray-700 font-medium">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient's wallet address"
                  value={formData.recipient}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recipient: e.target.value
                  }))}
                  required
                  className="bg-white border-gray-300 h-12 text-gray-900 font-mono text-sm placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-700 font-medium">Amount</Label>
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
                  className="bg-white border-gray-300 h-12 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base font-medium"
            >
              {loading ? "Processing..." : "Send"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-600">Date</TableHead>
                  <TableHead className="text-gray-600">Type</TableHead>
                  <TableHead className="text-gray-600">Amount</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                  <TableHead className="text-gray-600">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900">{new Date(tx.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="capitalize text-gray-900">{tx.type}</TableCell>
                    <TableCell className="text-gray-900">
                      {tx.amount.toLocaleString()} {tx.token.symbol}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-gray-600">
                      {tx.wallet.address.slice(0, 6)}...{tx.wallet.address.slice(-4)}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
