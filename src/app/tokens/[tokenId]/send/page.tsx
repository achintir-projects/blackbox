"use client"

import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
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
