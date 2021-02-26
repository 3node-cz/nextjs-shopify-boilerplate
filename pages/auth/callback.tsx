import React, { useEffect } from 'react'
import { NextPageContext } from 'next'
import { handleCallback } from '@/lib/auth'

const Callback = () => {
  return <div>Loading ...</div>
}

export const getServerSideProps = async (ctx: NextPageContext) => {
  const props = await handleCallback(ctx)
  return props
}

export default Callback
