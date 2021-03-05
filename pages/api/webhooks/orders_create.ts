import { NextApiRequest, NextApiResponse } from 'next'

import { getWebhook } from '@/lib/auth'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const webhook = await getWebhook(req)

  console.log(webhook)

  res.json('ok')
}

export const config = {
  api: {
    bodyParser: false,
  },
}
