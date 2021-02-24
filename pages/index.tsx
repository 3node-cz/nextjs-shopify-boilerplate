import React, { useEffect } from 'react'
import { NextPageContext } from 'next'

import { Provider } from '@shopify/app-bridge-react'
import { createApp } from '@shopify/app-bridge'
import { Redirect } from '@shopify/app-bridge/actions'
import { authenticatedFetch, getSessionToken } from '@shopify/app-bridge-utils'
import App from '@/modules/App'
import db from '@/db'
import { getAuthorizationUrl, getScopes, scopesAreSame, validateHmac } from 'auth'

import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

import enTranslations from '@shopify/polaris/locales/en.json'
import { AppProvider } from '@shopify/polaris'
import '@shopify/polaris/dist/styles.css'

const Index = ({ config, redirectUrl }) => {
  const app = createApp(config)

  const client = new ApolloClient({
    link: new HttpLink({
      uri: `/graphql`,
      credentials: 'include',
      fetch: authenticatedFetch(app),
    }),
    cache: new InMemoryCache(),
  })

  useEffect(() => {
    if (redirectUrl) {
      const redirect = Redirect.create(app)
      redirect.dispatch(Redirect.Action.REMOTE, redirectUrl)
    }
  }, [])

  return (
    <AppProvider i18n={enTranslations}>
      <ApolloProvider client={client}>
        <Provider config={config}>
          <App />
        </Provider>
      </ApolloProvider>
    </AppProvider>
  )
}

export const getServerSideProps = async (ctx: NextPageContext) => {
  const shopOrigin = ctx.query.shop as string
  const shop = ctx.query.shop ? await db.shop.findUnique({ where: { shopOrigin } }) : null
  const scopes = shop && shop.token ? await getScopes(shopOrigin, shop.token) : null

  if (!validateHmac(ctx)) {
    ctx.res.writeHead(400, 'Bad request')
    ctx.res.write('Bad request')
    ctx.res.end()
    return {
      props: {},
    }
  }

  if (!scopes) {
    const { url, nonce } = getAuthorizationUrl(ctx)

    if (shop) {
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

export default Index
