import { NextApiRequest, NextApiResponse } from 'next'
import { proxy, getVerifiedData } from '@/lib/shopify'
import db from '@/lib/db'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await getVerifiedData(req.headers.authorization)
  const shop = await db.shop.findUnique({ where: { shopOrigin: new URL(data.dest).host } })

  res.json('ok')
  // proxy(shop.shopOrigin, shop.token, req, res)
}
