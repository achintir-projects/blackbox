import { authOptions } from "../../../../../lib/authOptions"
import { getServerSession } from "next-auth/next"
import prisma from "../../../../../lib/prisma"

export async function POST(req: Request, { params }: { params: { tokenId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.address) {
      console.error("Unauthorized: No session or user address")
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    let receiverWalletAddress: string
    let amount: number
    try {
      const body = await req.json()
      receiverWalletAddress = body.receiverWalletAddress
      amount = body.amount
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 })
    }

    if (!receiverWalletAddress || !amount) {
      console.error("Missing required fields: receiverWalletAddress or amount")
      return new Response(JSON.stringify({ error: "Missing required fields: receiverWalletAddress, amount" }), { status: 400 })
    }

    let senderWallet
    try {
      senderWallet = await prisma.wallet.findUnique({
        where: { address: session.user.address }
      })
    } catch (dbError) {
      console.error("Database error finding sender wallet:", dbError)
      return new Response(JSON.stringify({ error: "Database error finding sender wallet" }), { status: 500 })
    }

    if (!senderWallet) {
      console.error("Sender wallet not found for address:", session.user.address)
      return new Response(JSON.stringify({ error: "Sender wallet not found" }), { status: 404 })
    }

    let token
    try {
      token = await prisma.token.findUnique({
        where: {
          walletId_symbol: {
            walletId: senderWallet.id,
            symbol: params.tokenId.toUpperCase()
          }
        }
      })
    } catch (dbError) {
      console.error("Database error finding token:", dbError)
      return new Response(JSON.stringify({ error: "Database error finding token" }), { status: 500 })
    }

    if (!token) {
      console.error("Token not found in sender wallet:", params.tokenId.toUpperCase())
      return new Response(JSON.stringify({ error: "Token not found in sender wallet" }), { status: 404 })
    }

    if (token.balance < amount) {
      console.error("Insufficient token balance:", token.balance, "requested:", amount)
      return new Response(JSON.stringify({ error: "Insufficient token balance" }), { status: 400 })
    }

    let receiverWallet
    try {
      receiverWallet = await prisma.wallet.findUnique({
        where: { address: receiverWalletAddress }
      })
    } catch (dbError) {
      console.error("Database error finding receiver wallet:", dbError)
      return new Response(JSON.stringify({ error: "Database error finding receiver wallet" }), { status: 500 })
    }

    if (!receiverWallet) {
      console.error("Receiver wallet not found:", receiverWalletAddress)
      return new Response(JSON.stringify({ error: "Receiver wallet not found" }), { status: 404 })
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.token.update({
          where: { id: token.id },
          data: { balance: { decrement: amount } }
        })

        let receiverToken = await tx.token.findUnique({
          where: {
            walletId_symbol: {
              walletId: receiverWallet.id,
              symbol: params.tokenId.toUpperCase()
            }
          }
        })

        if (receiverToken) {
          await tx.token.update({
            where: { id: receiverToken.id },
            data: { balance: { increment: amount } }
          })
        } else {
          receiverToken = await tx.token.create({
            data: {
              walletId: receiverWallet.id,
              symbol: params.tokenId.toUpperCase(),
              name: token.name,
              balance: amount,
              price: token.price
            }
          })
        }

        await tx.transaction.createMany({
          data: [
            {
              walletId: senderWallet.id,
              tokenId: token.id,
              type: "send",
              amount,
              status: "completed"
            },
            {
              walletId: receiverWallet.id,
              tokenId: receiverToken.id,
              type: "receive",
              amount,
              status: "completed"
            }
          ]
        })
      })
    } catch (txError) {
      console.error("Transaction error:", txError)
      return new Response(JSON.stringify({ error: "Transaction failed", details: txError instanceof Error ? txError.message : String(txError) }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error("Unexpected error in token send API:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }), { status: 500 })
  }
}
