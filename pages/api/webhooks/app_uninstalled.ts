import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { webhookVerification } from '@/shopify'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const db = new PrismaClient()

  const webhook = await webhookVerification(req)
  if (webhook.verified) {
    const shop = await db.shop.update({
      where: { shopOrigin: webhook.domain as string },
      data: {
        token: null,
      },
    })
  } else {
    throw new Error('Webhook is not verified')
  }

  res.json({ message: 'ok' })

  await db.$disconnect()
}
