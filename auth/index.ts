import qs from 'querystring'
import crypto from 'crypto'
import { Method, StatusCode, Header } from '@shopify/network'
import { intersection } from 'lodash'
import Koa from 'koa'
import { NextPageContext } from 'next'
// import config from '../config'

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
