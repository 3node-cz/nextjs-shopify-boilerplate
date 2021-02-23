import React, { useEffect } from 'react'
import { NextPageContext } from 'next'
import { handleAuthCallback, scopesAreSame, authorizeRedirect } from '@/auth'
import { PrismaClient } from '@prisma/client'
import qs from 'querystring'

import { clearWebhooks, registerWebhooks, createClient } from '@/shopify'
import { WebhookSubscriptionTopic } from '@/generated/graphql'

const Callback = () => {
  return <div>Loading ...</div>
}

export const getServerSideProps = async (ctx: NextPageContext) => {
  const db = new PrismaClient()
  const shopOrigin = ctx.query.shop as string

  const shop = await db.shop.findUnique({ where: { shopOrigin } })

  const data = await handleAuthCallback(ctx)
  const token = data.access_token as string

  await db.shop.update({
    where: { shopOrigin },
    data: {
      nonce: null,
      token,
      updatedAt: new Date(),
    },
  })

  const client = createClient(shop.shopOrigin, token)

  await clearWebhooks(client)

  await registerWebhooks(
    client,
    WebhookSubscriptionTopic.AppUninstalled,
    `https://${ctx.req.headers.host}/api/webhooks/app_uninstalled`,
  )

  return {
    redirect: { destination: `/?${qs.stringify(ctx.query)}`, permanent: false },
  }
}

export default Callback
