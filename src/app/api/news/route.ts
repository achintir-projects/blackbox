import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Using CryptoCompare News API
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${process.env.CRYPTOCOMPARE_API_KEY || ''}`
    )
    
    const data = await response.json()
    
    if (!data.Data) {
      throw new Error('Invalid response from CryptoCompare')
    }

    const news = data.Data.map((item: any) => ({
      title: item.title,
      url: item.url,
      description: item.body.slice(0, 200) + '...',
      source: item.source,
      publishedAt: item.published_on * 1000, // Convert to milliseconds
      imageUrl: item.imageurl
    }))

    return NextResponse.json({
      success: true,
      data: news.slice(0, 10) // Return only the 10 most recent news items
    })
  } catch (error) {
    console.error('Failed to fetch news:', error)
    
    // Return mock data if API call fails
    const mockNews = [
      {
        title: "Bitcoin Reaches New Heights",
        url: "#",
        description: "Bitcoin continues its upward trend as institutional adoption increases...",
        source: "Crypto News",
        publishedAt: Date.now(),
        imageUrl: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg"
      },
      {
        title: "Ethereum 2.0 Development Update",
        url: "#",
        description: "The latest developments in Ethereum 2.0 show promising progress...",
        source: "Blockchain Times",
        publishedAt: Date.now() - 3600000,
        imageUrl: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg"
      },
      {
        title: "DeFi Market Analysis",
        url: "#",
        description: "Decentralized Finance continues to grow as new protocols emerge...",
        source: "DeFi Daily",
        publishedAt: Date.now() - 7200000,
        imageUrl: "https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg"
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockNews
    })
  }
}
