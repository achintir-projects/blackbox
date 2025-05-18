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
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800`}>
        {showNav && (
          <nav className="border-b border-neutral-800">
            <NavigationMenu className="max-w-screen-xl mx-auto px-4">
              <NavigationMenuList className="flex gap-6 h-16 items-center">
                <NavigationMenuItem>
                  <Link 
                    href="/tokens" 
                    className={`hover:text-neutral-300 transition-colors ${
                      pathname === "/tokens" ? "text-blue-500" : "text-neutral-400"
                    }`}
                  >
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href="/tokens" 
                    className={`hover:text-neutral-300 transition-colors ${
                      pathname.startsWith("/tokens") && pathname !== "/tokens" 
                        ? "text-blue-500" 
                        : "text-neutral-400"
                    }`}
                  >
                    Tokens
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href="/settings" 
                    className={`hover:text-neutral-300 transition-colors ${
                      pathname === "/settings" ? "text-blue-500" : "text-neutral-400"
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
              background: "#1f2937",
              color: "#f3f4f6",
              border: "1px solid #374151"
            }
          }}
        />
      </body>
    </html>
  )
}
