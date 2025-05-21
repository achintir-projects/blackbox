import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./prisma"
import type { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text", placeholder: "0x..." },
      },
      async authorize(credentials, req) {
        if (!credentials?.address) {
          return null
        }
        const wallet = await prisma.wallet.findUnique({
          where: { address: credentials.address }
        })
        if (wallet) {
          return { id: wallet.id.toString(), name: wallet.address }
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
        token.address = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
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
