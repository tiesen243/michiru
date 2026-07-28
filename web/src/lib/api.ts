import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import type { Service } from 'effect/Context'
import type { ManagedRuntime } from 'effect/ManagedRuntime'
import type { Schema } from 'effect/Schema'
import type { Client } from 'effect/unstable/httpapi/HttpApiClient'
import type { HttpApiEndpoint } from 'effect/unstable/httpapi/HttpApiEndpoint'

import * as Effect from 'effect/Effect'

export function createTanstackQueryProxy<TServiceTag, TService>(
  runtime: ManagedRuntime<TServiceTag, never>,
  tag: Service<TServiceTag, TService>
): TanstackQueryProxy<TService> {
  const cache = new Map<string, unknown>()

  const createProxy = (path: string[]): unknown => {
    const cacheKey = path.join('.')
    if (cache.has(cacheKey)) return cache.get(cacheKey)

    const proxy = new Proxy(function () {}, {
      get(_target, prop) {
        if (typeof prop === 'symbol' || prop === 'then') return undefined
        return createProxy([...path, String(prop)])
      },
      apply(_target, _thisArg, args) {
        const action = path[path.length - 1]
        const apiPath = path.slice(0, -1)
        const [input, options] = args

        const execute = (params: unknown, signal?: AbortSignal) =>
          runtime.runPromise(
            Effect.gen(function* () {
              const api: any = yield* tag

              let fn = api
              for (const p of apiPath) fn = fn[p]

              return yield* fn(params)
            }) as Effect.Effect<unknown, unknown, TServiceTag>,
            { signal }
          )

        const createKey = (queryType: string, input: unknown) => [
          { type: queryType },
          ...apiPath,
          ...(input ? [input] : []),
        ]

        if (action === 'queryOptions')
          return {
            ...options,
            queryKey: createKey('query', input),
            queryFn: ({ signal }) => execute(input, signal),
          } satisfies UseQueryOptions

        if (action === 'getQueryKey') return createKey('query', input)

        if (action === 'mutationOptions')
          return {
            ...options,
            mutationKey: createKey('mutation', input),
            mutationFn: (payload) => execute({ payload }),
          } satisfies UseMutationOptions
      },
    })

    cache.set(cacheKey, proxy)
    return proxy
  }

  return createProxy([]) as TanstackQueryProxy<TService>
}

export type TanstackQueryProxy<T> =
  T extends Client.Method<
    HttpApiEndpoint<
      infer _Key,
      infer Method,
      infer _Path,
      infer Params,
      infer Query,
      infer Payload,
      infer Headers,
      infer Success,
      infer Error
    >,
    infer _Error,
    infer _Requires
  >
    ? {
        queryOptions: Method extends 'GET'
          ? <
              TQuery = UseQueryOptions<
                UnwrapCodec<Success>,
                UnwrapCodec<Error>
              >,
            >(
              input: MakeOptionalInput<
                ([Params] extends [never]
                  ? {}
                  : { params: UnwrapCodec<Params> }) &
                  ([Query] extends [never]
                    ? {}
                    : { query: UnwrapCodec<Query> }) &
                  ([Headers] extends [never]
                    ? {}
                    : { headers: UnwrapCodec<Headers> })
              >,
              options?: Omit<TQuery, 'queryKey' | 'queryFn'>
            ) => TQuery
          : never
        mutationOptions: Method extends 'GET'
          ? never
          : <
              TMutation = UseMutationOptions<
                UnwrapCodec<Success>,
                UnwrapCodec<Error>,
                UnwrapCodec<Payload>
              >,
            >(
              input: MakeOptionalInput<
                ([Params] extends [never]
                  ? {}
                  : { params: UnwrapCodec<Params> }) &
                  ([Headers] extends [never]
                    ? {}
                    : { headers: UnwrapCodec<Headers> })
              >,
              options?: Omit<TMutation, 'mutationKey' | 'mutationFn'>
            ) => TMutation

        getQueryKey: Method extends 'GET'
          ? (
              input: MakeOptionalInput<
                ([Params] extends [never]
                  ? {}
                  : { params: UnwrapCodec<Params> }) &
                  ([Query] extends [never]
                    ? {}
                    : { query: UnwrapCodec<Query> }) &
                  ([Headers] extends [never]
                    ? {}
                    : { headers: UnwrapCodec<Headers> })
              >
            ) => readonly unknown[]
          : never
      }
    : T extends object
      ? {
          readonly [K in keyof T]: TanstackQueryProxy<T[K]>
        }
      : T

type UnwrapCodec<T> =
  T extends Schema<unknown>
    ? Schema.Type<T>
    : T extends object
      ? { [K in keyof T]: UnwrapCodec<T[K]> }
      : T

type MakeOptionalInput<T> = keyof T extends never ? void | undefined : T
