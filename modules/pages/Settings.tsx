import { useShopQuery } from '@/generated/graphql'
import { Page, Card, Spinner } from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import Link from '@/modules/components/Link'

const Settings = () => {
  const { data } = useShopQuery()

  return (
    <Page title="Settings">
      <TitleBar title="Settings" />
      <Link to="/">Back</Link>
      <hr />
      <Card sectioned>{data && <h3>{data.shop.shopOrigin}</h3>}</Card>
    </Page>
  )
}

export default Settings
