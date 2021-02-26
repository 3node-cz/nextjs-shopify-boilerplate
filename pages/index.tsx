import React, { useEffect } from 'react'
import { NextPageContext } from 'next'

import { Provider } from '@shopify/app-bridge-react'
import { createApp } from '@shopify/app-bridge'
import { Redirect } from '@shopify/app-bridge/actions'
import { authenticatedFetch, getSessionToken } from '@shopify/app-bridge-utils'
import App from '@/modules/App'
import { verifyRequest } from '@/lib/auth'

import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

import enTranslations from '@shopify/polaris/locales/en.json'
import { AppProvider } from '@shopify/polaris'
import '@shopify/polaris/dist/styles.css'

const Index = ({ config, redirectUrl }) => {
  const app = createApp(config)

  const client = new ApolloClient({
    link: new HttpLink({
      uri: `/api/shopify`,
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
  const props = await verifyRequest(ctx)
  return props
}

export default Index
