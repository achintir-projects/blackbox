"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Toaster } from "sonner"
import Link from "next/link"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showNav = pathname !== "/"

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        {showNav && (
          <nav className="border-b border-gray-200 bg-white">
            <NavigationMenu className="max-w-screen-xl mx-auto px-4">
              <NavigationMenuList className="flex gap-6 h-16 items-center">
                <NavigationMenuItem>
                  <Link 
                    href="/tokens" 
                    className={`hover:text-gray-900 transition-colors ${
                      pathname === "/tokens" ? "text-blue-600 font-medium" : "text-gray-600"
                    }`}
                  >
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href="/tokens" 
                    className={`hover:text-gray-900 transition-colors ${
                      pathname.startsWith("/tokens") && pathname !== "/tokens" 
                        ? "text-blue-600 font-medium" 
                        : "text-gray-600"
                    }`}
                  >
                    Tokens
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href="/settings" 
                    className={`hover:text-gray-900 transition-colors ${
                      pathname === "/settings" ? "text-blue-600 font-medium" : "text-gray-600"
                    }`}
                  >
                    Settings
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        )}
        <main className={`container mx-auto px-4 py-8 ${!showNav ? "pt-0" : ""}`}>
          {children}
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
            }
          }}
        />
      </body>
    </html>
  )
}
