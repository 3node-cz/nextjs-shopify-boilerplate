import React, { useEffect } from 'react'
import { useShopQuery } from '@/generated/graphql'
import { Page, Card, Spinner } from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import Link from '@/modules/components/Link'

const Home = () => {
  const { data, error, loading, refetch } = useShopQuery()

  return (
    <Page title="Testing app">
      <TitleBar title="Testing app" />
      <Link to="/settings">Settings</Link>
      <br />
      {data && (
        <Card>
          {loading && (
            <Card.Section>
              <Spinner size="small" />
            </Card.Section>
          )}
          <Card.Section>
            {data.shop.shopOrigin} {data.shop.createdAt}
          </Card.Section>
        </Card>
      )}
    </Page>
  )
}

export default Home
