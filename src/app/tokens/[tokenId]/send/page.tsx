import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function SendTokenPage({ params }: { params: { tokenId: string } }) {
  const { tokenId } = params
  const router = useRouter()
  const { data: session } = useSession()

  const [receiverWalletAddress, setReceiverWalletAddress] = useState('')
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSend = async () => {
    setError('')
    setSuccess('')

    if (!session) {
      setError('You must be signed in to send tokens.')
      return
    }

    if (!receiverWalletAddress || amount <= 0) {
      setError('Please enter a valid receiver address and amount.')
      return
    }

    try {
      const response = await fetch(`/api/tokens/${tokenId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverWalletAddress, amount })
      })

      const data = await response.json()

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
    }
  }

  if (!session) {
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
      <div>
        <label>Receiver Wallet Address:</label>
        <input
          type="text"
          value={receiverWalletAddress}
          onChange={(e) => setReceiverWalletAddress(e.target.value)}
        />
      </div>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <button onClick={handleSend}>Send</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
