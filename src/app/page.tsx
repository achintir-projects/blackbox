"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Image from "next/image"

interface NewsItem {
  title: string
  url: string
  description: string
  source: string
  publishedAt: string
  imageUrl?: string
}

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news')
        const data = await response.json()
        if (data.success) {
          setNews(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white border border-gray-200">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Crypto News</h1>
        <p className="mt-2 text-gray-600">Stay updated with the latest cryptocurrency news and market trends</p>
      </div>

      <div className="grid gap-6">
        {news.map((item, index) => (
          <Card 
            key={index} 
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="md:flex">
              {item.imageUrl && (
                <div className="md:w-1/4 relative">
                  <div className="aspect-[16/9] md:aspect-square relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                      className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                    />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 hover:text-blue-600">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{item.source}</span>
                    <time dateTime={item.publishedAt}>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </time>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}

        {news.length === 0 && !loading && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No news articles available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
