import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { proxy, getVerifiedData } from '@/lib/shopify'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const db = new PrismaClient()

  const data = await getVerifiedData(req.headers.authorization)
  const shop = await db.shop.findUnique({ where: { shopOrigin: new URL(data.dest).host } })

  await db.$disconnect()

  proxy(shop.shopOrigin, shop.token, req, res)
}
