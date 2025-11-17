import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"
import { redis } from "@/lib/database/redis"

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL!,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET!,
  secondaryStorage: {
    get: async (key: string) => {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    },
    set: async (key: string, value: any, ttl?: number) => {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(value))
      } else {
        await redis.set(key, JSON.stringify(value))
      }
    },
    delete: async (key: string) => {
      await redis.del(key)
    },
  },
})

