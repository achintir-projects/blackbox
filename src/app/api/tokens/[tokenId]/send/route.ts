import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'


export async function GET(req: Request, context: { params: { tokenId: string } }) {
  try {
    const { tokenId } = context.params

    const transactions = await prisma.transaction.findMany({
      where: {
        tokenId: Number(tokenId),
        type: 'send'
      },
      include: {
        wallet: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Error fetching send transactions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch send transactions'
    }, { status: 500 })
  }
}
