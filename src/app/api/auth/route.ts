import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, privateKey } = body

    if (action === 'create') {
      // Create a new wallet
      const wallet = ethers.Wallet.createRandom()
      
      return NextResponse.json({
        success: true,
        data: {
          address: wallet.address,
          // In a real app, you'd want to encrypt this before sending
          privateKey: wallet.privateKey,
        }
      })
    } 
    
    else if (action === 'import') {
      // Validate and import existing wallet
      try {
        const wallet = new ethers.Wallet(privateKey)
        
        return NextResponse.json({
          success: true,
          data: {
            address: wallet.address,
            privateKey: wallet.privateKey,
          }
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid private key'
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
