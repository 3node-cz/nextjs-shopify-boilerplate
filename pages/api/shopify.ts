import { NextApiRequest, NextApiResponse } from 'next'
import Cryptr from 'cryptr'
import { proxy, getVerifiedData } from '@/lib/shopify'
import db from '@/lib/db'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await getVerifiedData(req.headers.authorization)
  const shop = await db.shop.findUnique({ where: { shopOrigin: new URL(data.dest).host } })

  const c = new Cryptr(process.env.SHOPIFY_API_SECRET)

  proxy(shop.shopOrigin, c.decrypt(shop.token), req, res)
}
