import React from 'react'
import { useOrdersQuery } from '@/generated/graphql'
import { Page, Card, Spinner } from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import { nodeFromEdges as nfe } from '@/lib/shopify/utils'

const Home = () => {
  const { data, error, loading } = useOrdersQuery()

  return (
    <Page title="Home">
      <TitleBar title="Home" />
      {data && (
        <Card>
          {loading && (
            <Card.Section>
              <Spinner size="small" />
            </Card.Section>
          )}
          {nfe(data.orders).map((o) => (
            <Card.Section key={o.id}>
              <p>{o.customer?.email}</p>
              {nfe(o.lineItems).map((i) => (
                <p>{i.title}</p>
              ))}
            </Card.Section>
          ))}
        </Card>
      )}
    </Page>
  )
}

export default Home
