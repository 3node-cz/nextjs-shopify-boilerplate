import qs from 'querystring'
import crypto from 'crypto'
import { Method, StatusCode, Header } from '@shopify/network'
import db from '@/lib/db'
import { NextApiRequest, NextPageContext } from 'next'
import { clearWebhooks, registerWebhooks, createClient } from '@/lib/shopify'
import { WebhookSubscriptionTopic } from '@/generated/graphql'
import fs from 'fs'
import path from 'path'
import safeCompare from 'safe-compare'

export const handleCallback = async (ctx: NextPageContext) => {
  const shopOrigin = ctx.query.shop as string

  const shop = await db.shop.findUnique({ where: { shopOrigin } })

  const data = await handleAuthCallback(ctx)
  const token = data.access_token as string

  await db.shop.update({
    where: { shopOrigin },
    data: {
      nonce: null,
      token,
      updatedAt: new Date(),
    },
  })

  const client = createClient(shop.shopOrigin, token)

  await clearWebhooks(client)

  const webhooks = await getWebhooks()

  await Promise.all(
    webhooks.map((w) =>
      registerWebhooks(
        client,
        w.toUpperCase() as WebhookSubscriptionTopic,
        `https://${ctx.req.headers.host}/api/webhooks/${w}`,
      ),
    ),
  )

  return {
    redirect: { destination: `/?${qs.stringify(ctx.query)}`, permanent: false },
  }
}

interface IWebhookVerification {
  verified: boolean
  apiVersion: string
  domain: string
  topic: string
  payload: any
}

const readBodyToText = (req: NextApiRequest) =>
  new Promise<string>((resolve) => {
    let data = ''

    req.on('data', (chunk) => {
      data += chunk
    })

    req.on('end', () => {
      resolve(data)
    })
  })

export const getWebhook = async (req: NextApiRequest): Promise<IWebhookVerification> => {
  // We'll compare the hmac to our own hash
  const hmac = req.headers['x-shopify-hmac-sha256'] as string
  const apiVersion = req.headers['x-shopify-api-version'] as string
  const domain = req.headers['x-shopify-shop-domain'] as string
  const topic = req.headers['x-shopify-topic'] as string

  const data = req.body ? JSON.stringify(req.body) : await readBodyToText(req)

  const calculatedHmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET as string)
    .update(data, 'utf8')
    .digest('base64')

  return {
    verified: safeCompare(hmac, calculatedHmac),
    apiVersion,
    domain,
    topic,
    payload: JSON.parse(data),
  }
}

export const verifyRequest = async (ctx: NextPageContext) => {
  const shopOrigin = ctx.query.shop as string

  const shop = ctx.query.shop ? await db.shop.findUnique({ where: { shopOrigin } }) : null
  const scopes = shop && shop.token ? await getScopes(shopOrigin, shop.token) : null

  // if (!validateHmac(ctx)) {
  //   ctx.res.writeHead(400, 'Bad request')
  //   ctx.res.write('Bad request')
  //   ctx.res.end()
  //   return {
  //     props: {},
  //   }
  // }

  if (!scopes) {
    const { url, nonce } = getAuthorizationUrl(ctx)

    if (shop && shop.token) {
      return {
        props: {
          redirectUrl: url,
          config: {
            apiKey: process.env.SHOPIFY_API_KEY,
            shopOrigin: ctx.query.shop,
            forceRedirect: true,
          },
        },
      }
    }

    await db.shop.upsert({
      where: { shopOrigin },
      create: {
        shopOrigin,
        nonce,
      },
      update: {
        nonce,
      },
    })

    return {
      redirect: {
        destination: url,
        permanent: false,
      },
    }
  }

  return {
    props: {
      config: {
        apiKey: process.env.SHOPIFY_API_KEY,
        shopOrigin: ctx.query.shop,
        forceRedirect: true,
      },
    },
  }
}

// Utility methods

export const scopesAreSame = (serverScopes: string, tokenScopes: string) => {
  const scArr = serverScopes.split(',')
  const tsArr = tokenScopes.split(',')

  let diff = tsArr.filter((s) => scArr.indexOf(s) !== -1).length
  if (diff > 0) return false
  else {
    diff = scArr.filter((s) => tsArr.indexOf(s) !== -1).length
    return diff === 0
  }
}

const getWebhooks = async () => {
  const webhooksDirectory = path.join(process.cwd(), 'pages/api/webhooks')
  const webhooksFiles = fs.readdirSync(webhooksDirectory)

  return webhooksFiles.map((w) => w.replace('.ts', ''))
}

export const validateHmac = (ctx: NextPageContext) => {
  const { hmac, ...map } = ctx.query

  const message = qs.stringify(map)
  const providedHmac = Buffer.from(hmac as string, 'utf-8')
  const generatedHash = Buffer.from(
    crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET as string)
      .update(message)
      .digest('hex'),
    'utf-8',
  )
  return crypto.timingSafeEqual(providedHmac, generatedHash)
}

export const getAuthorizationUrl = (ctx: NextPageContext, scopeChanged?: boolean) => {
  const redirect_uri = encodeURI(`https://${ctx.req.headers.host}/auth/callback`)
  const nonce = crypto.randomBytes(16).toString('base64')
  const scopes = process.env.SCOPES
  const shop = ctx.query.shop
  const mode = scopeChanged ? 'request_grant' : 'authorize'
  const apiKey = process.env.SHOPIFY_API_KEY

  const url = `https://${shop}/admin/oauth/${mode}?redirect_uri=${redirect_uri}&client_id=${apiKey}&scope=${scopes}&state=${nonce}&grant_options[]=offline`

  return { url, nonce }
}

export const authorizeRedirect = (ctx: NextPageContext, scopeChanged?: boolean) => {
  console.log(ctx.req.headers.host)
  const { url } = getAuthorizationUrl(ctx, scopeChanged)

  ctx.res.writeHead(302, { Location: url })
  ctx.res.end()
}

export const handleAuthCallback = async (ctx: NextPageContext) => {
  const { shop, code } = ctx.query
  const url = `https://${ctx.query.shop}/admin/oauth/access_token`

  const accessTokenQuery = qs.stringify({
    client_id: process.env.SHOPIFY_API_KEY,
    client_secret: process.env.SHOPIFY_API_SECRET,
    code,
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(accessTokenQuery).toString(),
    },
    body: accessTokenQuery,
  })

  const data = await response.json()

  return data
}

export const getScopes = async (shop: string, accessToken: string) => {
  const response = await fetch(`https://${shop}/admin/oauth/access_scopes.json`, {
    method: Method.Get,
    headers: {
      [Header.ContentType]: 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
  })

  if (response.status === StatusCode.Unauthorized) {
    return null
  }

  const data = await response.json()

  return data.access_scopes.map((s) => s.handle)
}
