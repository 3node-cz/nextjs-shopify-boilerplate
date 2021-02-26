import { NextApiRequest, NextApiResponse } from 'next'

import { getWebhook } from '@/lib/auth'
import db from '@/lib/db'

const webhook = async (req: NextApiRequest, res: NextApiResponse) => {
  const webhook = await getWebhook(req)

  console.log(webhook)

  if (webhook.verified) {
    // await db.shop.delete({ where: { shopOrigin: webhook.domain as string } })

    const shop = await db.shop.update({
      where: { shopOrigin: webhook.domain as string },
      data: {
        token: null,
        updatedAt: new Date(),
      },
    })
  } else {
    throw new Error('Webhook is not verified')
  }

  res.json({ message: 'ok' })
}

export default webhook
