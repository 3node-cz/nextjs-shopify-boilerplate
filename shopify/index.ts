import { NextApiRequest, NextApiResponse } from 'next'
import request from 'request'
import isVerified from 'shopify-jwt-auth-verify'
import verifyWebhook from 'verify-shopify-webhook'
import 'isomorphic-fetch'

import { GraphQLClient } from 'graphql-request'
import { getSdk, Sdk, WebhookSubscriptionTopic } from '@/generated/sdk'

export const createClient = (shop: string, accessToken: string) => {
  const gqlClient = new GraphQLClient(`https://${shop}/admin/api/2021-01/graphql.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'User-Agent': `shopify-app-node ${process.env.npm_package_version} | Shopify App CLI`,
    },
  })

  return getSdk(gqlClient)
}

export const getVerifiedData = (authorizationHeader): any =>
  new Promise((resolve, reject) => {
    try {
      isVerified(authorizationHeader, process.env.SHOPIFY_API_SECRET, (data) => {
        resolve(JSON.parse(data.payload))
      })
    } catch (e) {
      reject(e)
    }
  })

export const proxy = (
  shop: string,
  accessToken: string,
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const proxy = request({
    url: `https://${shop}/admin/api/2021-01/graphql.json`,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
      'User-Agent': `shopify-app-node ${process.env.npm_package_version} | Shopify App CLI`,
    },
    body: JSON.stringify(req.body),
  })

  proxy
    .on('error', (error) => {
      res.json({ error })
    })
    .pipe(res)
}

export const clearWebhooks = async (client: Sdk) => {
  const {
    webhookSubscriptions: { edges: webhooks },
  } = await client.webhookSubscriptions()

  await Promise.all(webhooks.map(({ node: wh }) => client.webhookSubscriptionDelete({ id: wh.id })))
}
export const registerWebhooks = async (
  client: Sdk,
  topic: WebhookSubscriptionTopic,
  url: string,
) => {
  const {
    webhookSubscriptionCreate: { userErrors },
  } = await client.webhookSubscriptionCreate({
    topic,
    webhookSubscription: {
      callbackUrl: url,
    },
  })

  console.log(
    'Webhook registration: ',
    topic,
    userErrors.length === 0 ? 'Success' : JSON.stringify(userErrors, null, 2),
  )
}

export const webhookVerification = async (req: NextApiRequest) => {
  return await verifyWebhook(req, process.env.SHOPIFY_API_SECRET)
}
