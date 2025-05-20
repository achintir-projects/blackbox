import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request, context: { params: { tokenId: string } }) {
  try {
    const tokenId = parseInt(context.params.tokenId)
    const transactions = await prisma.transaction.findMany({
      where: { tokenId },
      orderBy: { createdAt: 'desc' },
      include: {
        wallet: true
      }
    })

    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
