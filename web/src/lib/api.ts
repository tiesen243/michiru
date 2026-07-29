import { createTanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'
import { ApiClient } from '@web/lib/api.client'
import { runtime } from '@web/lib/runtime'

export const api = createTanstackQueryOptionsProxy(ApiClient, runtime)
