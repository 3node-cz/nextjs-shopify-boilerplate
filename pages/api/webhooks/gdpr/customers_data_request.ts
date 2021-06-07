import { NextApiRequest, NextApiResponse } from 'next'

import { getWebhook } from '@/lib/auth'

// Requests to view stored customer data.
// https://shopify.dev/tutorials/add-gdpr-webhooks-to-your-app#customers-data_request
/** WEBHOOK PAYLOAD
 * {
  "shop_id": 954889,
  "shop_domain": "snowdevil.myshopify.com",
  "orders_requested": [299938, 280263, 220458],
  "customer": { -- In some cases, a customer record contains only the customer's email address.
    "id": 191167,
    "email": "john@email.com",
    "phone":  "555-625-1199"
  },
  "data_request": {
    "id": 9999
  }
}
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({})
}

export const config = {
  api: {
    bodyParser: false,
  },
}
