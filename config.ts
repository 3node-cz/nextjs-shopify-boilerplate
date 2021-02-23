import { load } from 'ts-dotenv'

const config = load({
  PORT: Number,
  NODE_ENV: ['production' as const, 'development' as const],
  SHOPIFY_API_SECRET: String,
  SHOPIFY_API_KEY: String,
  SCOPES: String,
})

export default config
