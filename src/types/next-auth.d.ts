import NextAuth from "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      address: string
    } & DefaultSession["user"]
  }
  interface User {
    id: string
    address: string
  }
}
