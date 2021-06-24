import { NextApiRequest, NextApiResponse } from 'next'

import { getWebhook } from '@/lib/auth'


// Requests deletion of shop data.
// https://shopify.dev/tutorials/add-gdpr-webhooks-to-your-app#shop-redact
/** WEBHOOK PAYLOAD
 * 
 * {
    "shop_id": 954889,
    "shop_domain": "snowdevil.myshopify.com"
    }
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).send('Ok')
  const webhook = await getWebhook(req)
  const { domain: shopOrigin } = webhook

  // TODO - delete all shop data here
  console.warn(`Shop ${shopOrigin} data NOT DELETED - Webhook not implemented`)
}

export const config = {
  api: {
    bodyParser: false,
  },
}
