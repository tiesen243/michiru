import * as Clock from 'effect/Clock'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as MutableHashMap from 'effect/MutableHashMap'
import * as Option from 'effect/Option'
import * as PubSub from 'effect/PubSub'
import * as Stream from 'effect/Stream'
import * as SynchronizedRef from 'effect/SynchronizedRef'

export class StreamService extends Context.Service<
  StreamService,
  {
    readonly register: (connectionId: string) => Effect.Effect<void>
    readonly unregister: (connectionId: string) => Effect.Effect<void>

    readonly publish: (
      connectionId: string,
      message: string
    ) => Effect.Effect<void>
    readonly subscribe: (connectionId: string) => Stream.Stream<string>
  }
>()('StreamService') {
  public static live = Layer.effect(
    this,
    Effect.gen(function* () {
      const connections = yield* SynchronizedRef.make(
        MutableHashMap.empty<string, StreamService.ActiveConnection>()
      )

      const register = Effect.fn(function* (connectionId: string) {
        const pubsub = yield* PubSub.unbounded<string>()

        yield* SynchronizedRef.updateEffect(connections, (map) =>
          Clock.currentTimeMillis.pipe(
            Effect.map((now) => {
              const activeConnection = {
                connectionId,
                lastActivityTimestamp: now,
                pubsub,
              } satisfies StreamService.ActiveConnection

              return MutableHashMap.set(map, connectionId, activeConnection)
            }),
            Effect.tap(() =>
              Effect.logDebug(`Registered connection: ${connectionId}`)
            )
          )
        )
      })

      const unregister = Effect.fn(function* (connectionId: string) {
        yield* SynchronizedRef.updateEffect(connections, (map) => {
          const connection = MutableHashMap.get(map, connectionId)

          if (Option.isNone(connection)) return Effect.succeed(map)

          const activeConnection = connection.value
          MutableHashMap.remove(map, connectionId)

          return PubSub.shutdown(activeConnection.pubsub).pipe(
            Effect.tap(() =>
              Effect.logDebug(`Unregistered connection: ${connectionId}`)
            ),
            Effect.as(map)
          )
        })
      })

      const publish = (connectionId: string, message: string) =>
        SynchronizedRef.get(connections).pipe(
          Effect.flatMap((map) => {
            const connectionOpt = MutableHashMap.get(map, connectionId)
            if (Option.isNone(connectionOpt))
              return Effect.logWarning(
                `Failed to publish. Connection not found: ${connectionId}`
              ).pipe(Effect.as(false))

            const activeConn = connectionOpt.value
            return PubSub.publish(activeConn.pubsub, message)
          })
        )

      const subscribe = (connectionId: string): Stream.Stream<string> =>
        Stream.unwrap(
          SynchronizedRef.get(connections).pipe(
            Effect.map((map) => {
              const connectionOpt = MutableHashMap.get(map, connectionId)
              if (Option.isNone(connectionOpt)) {
                return Stream.empty
              }
              return Stream.fromPubSub(connectionOpt.value.pubsub)
            })
          )
        )

      return {
        register,
        unregister,

        publish,
        subscribe,
      }
    })
  )
}

export namespace StreamService {
  export interface ActiveConnection {
    connectionId: string
    lastActivityTimestamp: number
    pubsub: PubSub.PubSub<string>
  }
}
