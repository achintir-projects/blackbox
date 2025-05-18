import { providers, Contract, utils } from 'ethers'
import axios from 'axios'

const ERC20_ABI = [
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)'
]

export async function getTokenDetails(contractAddress: string) {
  if (!utils.isAddress(contractAddress)) {
    return {
      success: false,
      error: 'Invalid contract address'
    }
  }

  const provider = new providers.JsonRpcProvider(
    process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
  )
  
  const contract = new Contract(contractAddress, ERC20_ABI, provider)

  try {
    const [symbol, name] = await Promise.all([
      contract.symbol(),
      contract.name()
    ])

    // Try to get price from CoinGecko
    let price = 0
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`
      )
      price = response.data[symbol.toLowerCase()]?.usd || 0
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error)
    }

    return {
      success: true,
      data: {
        symbol,
        name,
        price
      }
    }
  } catch (error) {
    console.error('Error fetching token details:', error)
    return {
      success: false,
      error: 'Invalid ERC20 token contract'
    }
  }
}
