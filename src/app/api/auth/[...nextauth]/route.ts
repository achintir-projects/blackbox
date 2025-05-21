import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "../../../../lib/prisma"

const authOptions = {
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
    strategy: "jwt",
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

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
