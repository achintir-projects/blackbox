import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./prisma"
import type { AuthOptions, User } from "next-auth"

interface ExtendedUser extends User {
  address: string
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text", placeholder: "0x..." },
      },
      async authorize(credentials, req): Promise<ExtendedUser | null> {
        if (!credentials?.address) {
          return null
        }
        const wallet = await prisma.wallet.findUnique({
          where: { address: credentials.address }
        })
        if (wallet) {
          return { id: wallet.id.toString(), name: wallet.address, address: wallet.address } as ExtendedUser
        }
        // Wallet not found, create it
        try {
          const { default: initUserWallet } = await import('../../scripts/init-user-wallet.js')
          const { wallet: newWallet } = await initUserWallet(credentials.address as unknown as null | undefined)
          if (newWallet) {
            return { id: newWallet.id.toString(), name: newWallet.address, address: newWallet.address } as ExtendedUser
          }
        } catch (error) {
          console.error('Error creating wallet in authorize:', error)
        }
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.address = (user as ExtendedUser).address
      }
      return token
    },
    async session({ session, token }) {
      if (token && typeof token.id === "string" && typeof token.address === "string") {
        session.user.id = token.id
        session.user.address = token.address
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
