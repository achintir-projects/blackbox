import { authOptions } from "../../../../lib/authOptions"
import { getServerSession } from "next-auth/next"
import prisma from "../../../../../lib/prisma"

export async function POST(req: Request, { params }: { params: { tokenId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.address) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { receiverWalletAddress, amount } = await req.json()

    if (!receiverWalletAddress || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields: receiverWalletAddress, amount" }), { status: 400 })
    }

    const senderWallet = await prisma.wallet.findUnique({
      where: { address: session.user.address }
    })

    if (!senderWallet) {
      return new Response(JSON.stringify({ error: "Sender wallet not found" }), { status: 404 })
    }

    const token = await prisma.token.findUnique({
      where: {
        walletId_symbol: {
          walletId: senderWallet.id,
          symbol: params.tokenId.toUpperCase()
        }
      }
    })

    if (!token) {
      return new Response(JSON.stringify({ error: "Token not found in sender wallet" }), { status: 404 })
    }

    if (token.balance < amount) {
      return new Response(JSON.stringify({ error: "Insufficient token balance" }), { status: 400 })
    }

    const receiverWallet = await prisma.wallet.findUnique({
      where: { address: receiverWalletAddress }
    })

    if (!receiverWallet) {
      return new Response(JSON.stringify({ error: "Receiver wallet not found" }), { status: 404 })
    }

    // Perform token transfer logic here (update balances, create transactions, etc.)
    // For simplicity, assuming synchronous updates

    await prisma.$transaction(async (tx) => {
      await tx.token.update({
        where: { id: token.id },
        data: { balance: { decrement: amount } }
      })

      const receiverToken = await tx.token.findUnique({
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
        await tx.token.create({
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
            tokenId: receiverToken ? receiverToken.id : undefined,
            type: "receive",
            amount,
            status: "completed"
          }
        ]
      })
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
  }
}
