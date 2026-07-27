import type {
  MutationOptions,
  UndefinedInitialDataOptions,
} from '@tanstack/react-query'
import type * as Context from 'effect/Context'
import type { ManagedRuntime } from 'effect/ManagedRuntime'
import type { Schema } from 'effect/Schema'
import type { HttpApi } from 'effect/unstable/httpapi'
import type { Client, ForApi } from 'effect/unstable/httpapi/HttpApiClient'
import type { HttpApiEndpoint } from 'effect/unstable/httpapi/HttpApiEndpoint'

import { mutationOptions, queryOptions } from '@tanstack/react-query'
import * as Effect from 'effect/Effect'

type UnwrapCodec<T> =
  T extends Schema<any>
    ? Schema.Type<T>
    : T extends object
      ? { [K in keyof T]: UnwrapCodec<T[K]> }
      : T

export type TanstackQueryProxy<T> =
  T extends Client.Method<
    HttpApiEndpoint<
      infer _K, // Key
      infer M, // Method
      infer _P, // Path
      never,
      infer Q, // Query
      infer P, // Payload
      never,
      infer A, // Output
      infer E // Error
    >,
    never,
    never
  >
    ? {
        queryOptions: M extends 'GET'
          ? <
              TQuery = UndefinedInitialDataOptions<
                UnwrapCodec<A>,
                UnwrapCodec<E>
              >,
            >(
              input: UnwrapCodec<Q>,
              options?: Omit<TQuery, 'queryKey' | 'queryFn'>
            ) => TQuery
          : never
        mutationOptions: M extends 'GET'
          ? never
          : <
              TMutation = MutationOptions<
                UnwrapCodec<A>,
                UnwrapCodec<E>,
                UnwrapCodec<P>
              >,
            >(
              options?: Omit<TMutation, 'mutationKey' | 'mutationFn'>
            ) => TMutation
      }
    : T extends object
      ? {
          readonly [K in keyof T]: TanstackQueryProxy<T[K]>
        }
      : T

export function createTanstackQueryProxy<TApi extends HttpApi.Constraint>() {
  return function <TServiceTag, TService>(
    runtime: ManagedRuntime<TServiceTag, never>,
    tag: Context.Service<TServiceTag, TService>
  ): TanstackQueryProxy<ForApi<TApi>> {
    const createProxy = (path: string[]): any =>
      new Proxy(function () {}, {
        get(_target, prop) {
          if (typeof prop === 'symbol' || prop === 'then') return undefined
          return createProxy([...path, String(prop)])
        },
        apply(_target, _thisArg, args) {
          const action = path[path.length - 1]
          const apiPath = path.slice(0, -1)
          const input = args[0]

          const actionType = action === 'queryOptions' ? 'query' : 'mutation'
          const key = [
            { type: actionType },
            ...apiPath,
            ...(input ? [input] : []),
          ] as const

          const execute = (params: unknown, signal?: AbortSignal) =>
            runtime.runPromise(
              Effect.gen(function* () {
                const api: any = yield* tag

                let fn = api
                for (const p of apiPath) fn = fn[p]

                return yield* fn(params)
              }) as Effect.Effect<any, unknown, TServiceTag>,
              { signal }
            )

          if (action === 'queryOptions')
            return queryOptions({
              queryKey: key,
              queryFn: ({ signal }) => execute({ query: input }, signal),
            })

          if (action === 'mutationOptions')
            return mutationOptions({
              mutationKey: key,
              mutationFn: (input) => execute({ payload: input }),
            })
        },
      })

    return createProxy([]) as TanstackQueryProxy<ForApi<TApi>>
  }
}
