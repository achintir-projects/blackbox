import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { tokenId } = await params
    const id = parseInt(tokenId)
    
    const token = await prisma.token.findUnique({
      where: { id },
      include: {
        wallet: true,
        transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            wallet: true
          }
        }
      }
    })

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: token
    })
  } catch (error) {
    console.error('Error fetching token:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token'
    }, { status: 500 })
  }
}
