import type { TanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'

import { createTanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'
import { ApiClient } from '@web/lib/api.client'
import { useRuntime } from '@web/lib/runtime'
import * as React from 'react'

const ApiContext = React.createContext<TanstackQueryOptionsProxy<
  (typeof ApiClient)['Service']
> | null>(null)

const useApi = () => {
  const context = React.use(ApiContext)
  if (!context) throw new Error('useApi must be used within an ApiProvider')
  return context
}

function ApiProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const runtime = useRuntime()

  const [api] = React.useState(() =>
    createTanstackQueryOptionsProxy(ApiClient, runtime)
  )

  const value = React.useMemo(() => api, [api])

  return <ApiContext value={value}>{children}</ApiContext>
}

export { ApiProvider, useApi }
