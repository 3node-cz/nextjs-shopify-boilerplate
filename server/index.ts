import dotenv from 'dotenv'
import next from 'next'
import Koa, { Middleware } from 'koa'
import Router from 'koa-router'

import db from '@/db'

import { verifyRequest, handleCallback } from '@/server/auth'
import { proxyGraphql } from '@/shopify'
import { ContextualSaveBar } from '@shopify/polaris/dist/types/latest/src/components/Frame/components'

dotenv.config()
const port = parseInt(process.env.PORT, 10) || 8081
const dev = process.env.NODE_ENV !== 'production'

const app = next({
  dev,
})
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = new Koa()
  const router = new Router()

  router.get('/', verifyRequest(db), async (ctx) => {
    await handle(ctx.req, ctx.res)
  })

  router.get('/auth/callback', handleCallback(db))

  router.post('/graphql', proxyGraphql(db))

  router.get('(.*)', async (ctx) => {
    await handle(ctx.req, ctx.res)
  })

  server.use(router.allowedMethods())
  server.use(router.routes())
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
