import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Example: Use a public Ethereum RPC provider (Infura, Alchemy, etc.)
const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)

export async function GET(req: Request, { params }: { params: { contractAddress: string } }) {
  try {
    const { contractAddress } = params

    if (!ethers.utils.isAddress(contractAddress)) {
      return NextResponse.json({ success: false, error: 'Invalid contract address' }, { status: 400 })
    }

    // Minimal ERC20 ABI to get token details
    const ERC20_ABI = [
      'function symbol() view returns (string)',
      'function name() view returns (string)',
      'function decimals() view returns (uint8)'
    ]

    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider)

    const [symbol, name, decimals] = await Promise.all([
      contract.symbol(),
      contract.name(),
      contract.decimals()
    ])

    // Return token details
    return NextResponse.json({
      success: true,
      data: {
        contractAddress,
        symbol,
        name,
        decimals
      }
    })
  } catch (error) {
    console.error('Failed to fetch token details:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch token details' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
