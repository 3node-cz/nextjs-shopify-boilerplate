import { NextApiRequest, NextApiResponse } from 'next'

// Requests deletion of customer data.
// https://shopify.dev/tutorials/add-gdpr-webhooks-to-your-app#customers-redact
/** WEBHOOK PAYLOAD
 * {
  "shop_id": 954889,
  "shop_domain": "snowdevil.myshopify.com",
  "customer": { -- In some cases, a customer record contains only the customer's email address.
    "id": 191167,
    "email": "john@email.com",
    "phone": "555-625-1199"
  },
  "orders_to_redact": [299938, 280263, 220458]
}
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).send('Ok')
}

export const config = {
  api: {
    bodyParser: false,
  },
}
