import db from '@/lib/db'
import { Resolvers } from '@/generated/graphql'
import { createAuthenticatedClient } from '@/lib/shopify'

export const resolvers: Resolvers = {
  Query: {
    shop: async (p, a, { shopOrigin }) => {
      const shop = await db.shop.findUnique({ where: { shopOrigin } })

      return {
        ...shop,
        webhooks: [],
      }
    },
  },
}
