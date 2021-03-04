import { gql } from 'apollo-server-micro'
import db from '@/lib/db'
import { Resolvers } from '@/generated/graphql'

export const resolvers: Resolvers = {
  Query: {
    shop: (p, a, { shopOrigin }) => {
      console.log(shopOrigin)
      return db.shop.findUnique({ where: { shopOrigin } })
    },
  },
}
