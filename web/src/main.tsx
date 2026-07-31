import '@web/main.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from '@web/app'
import { ApiProvider } from '@web/lib/api'
import { RuntimeProvider } from '@web/lib/runtime'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

const elem = document.getElementById('root')!
const app = (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RuntimeProvider>
        <ApiProvider>
          <App />
        </ApiProvider>
      </RuntimeProvider>
    </QueryClientProvider>
  </StrictMode>
)

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
;(import.meta.hot.data.root ??= createRoot(elem)).render(app)
