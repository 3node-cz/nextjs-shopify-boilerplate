import { NextApiRequest, NextApiResponse } from 'next'
import { getVerifiedData } from '@/lib/shopify'
import db from '@/lib/db'
import path from 'path'
import fs from 'fs'

import { ApolloServer, gql } from 'apollo-server-micro'
import { mergeResolvers } from '@graphql-tools/merge'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'

import * as App from '@/graphql/app'
import * as Shop from '@/graphql/shop'

const schema = loadSchemaSync(path.join(process.cwd(), 'graphql/*.schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
})
const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers: mergeResolvers([App.resolvers, Shop.resolvers]),
})

const graphEndpoint = new ApolloServer({
  schema: schemaWithResolvers,
  context: async ({ req }: { req: NextApiRequest }) => {
    const { dest } = await getVerifiedData(req)

    return {
      shopOrigin: new URL(dest).host,
    }
  },
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default graphEndpoint.createHandler({ path: '/api/graphql' })
