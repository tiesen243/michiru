import { createTanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'
import { ApiClient } from '@web/lib/api-client'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'

const layer = Layer.mergeAll(ApiClient.live)
export const runtime = ManagedRuntime.make(layer)
export const api = createTanstackQueryOptionsProxy(ApiClient, runtime)
