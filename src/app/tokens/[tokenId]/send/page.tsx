"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function SendTokenPage({ params }: { params: { tokenId: string } }) {
  const { tokenId } = params
  const router = useRouter()
  const session = useSession()

  const [receiverWalletAddress, setReceiverWalletAddress] = useState('')
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // New state to track if the send API call is in progress
  const [isSending, setIsSending] = useState(false)

  // New effect to log network requests for debugging
  useEffect(() => {
    const handleFetch = async () => {
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        console.log('Fetch called with args:', args)
        const response = await originalFetch(...args)
        console.log('Fetch response:', response)
        return response
      }
    }
    handleFetch()
  }, [])

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!session.data) {
      setError('You must be signed in to send tokens.')
      return
    }

    if (!receiverWalletAddress || amount <= 0) {
      setError('Please enter a valid receiver address and amount.')
      return
    }

    if (isSending) {
      setError('Send request already in progress. Please wait.')
      return
    }

    setIsSending(true)

    try {
      const response = await fetch(`/api/tokens/${tokenId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverWalletAddress, amount })
      })

      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (jsonError) {
        setError('Invalid JSON response from server')
        setIsSending(false)
        return
      }

      if (data.success) {
        setSuccess('Tokens sent successfully!')
        setReceiverWalletAddress('')
        setAmount(0)
        router.refresh()
      } else {
        setError(data.error || 'Failed to send tokens')
      }
    } catch (err) {
      setError('An error occurred while sending tokens')
    } finally {
      setIsSending(false)
    }
  }

  if (!session || !session.data) {
    return (
      <div>
        <p>You must be signed in to send tokens.</p>
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    )
  }

  return (
    <div>
      <h1>Send Token</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSend}>
        <div>
          <label>Receiver Wallet Address:</label>
          <input
            type="text"
            value={receiverWalletAddress}
            onChange={(e) => setReceiverWalletAddress(e.target.value)}
            disabled={isSending}
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={isSending}
          />
        </div>
        <button type="submit" disabled={isSending}>Send</button>
        <button type="button" onClick={() => signOut()} disabled={isSending}>Sign Out</button>
      </form>
    </div>
  )
}
