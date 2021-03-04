import React from 'react'
import { useShopQuery } from '@/generated/graphql'
import { Page, Card, Spinner } from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import { nodeFromEdges as nfe } from '@/lib/shopify/utils'
import { Link } from 'react-router-dom'

const Home = () => {
  const { data, error, loading } = useShopQuery()

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
          {/* {nfe(data.orders).map((o) => (
            <Card.Section key={o.id}>
              <p>{o.customer?.email}</p>
              {nfe(o.lineItems).map((i) => (
                <p>{i.title}</p>
              ))}
            </Card.Section>
          ))} */}
        </Card>
      )}
    </Page>
  )
}

export default Home
