import { NextApiRequest, NextApiResponse } from 'next'

import { getWebhook } from '@/lib/auth'

const webhook_carts_update = async (req: NextApiRequest, res: NextApiResponse) => {
  const webhook = await getWebhook(req)

  console.log(webhook)

  res.json('ok')
}

export default webhook_carts_update

export const config = {
  api: {
    bodyParser: false,
  },
}
