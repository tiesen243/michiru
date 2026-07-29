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
    readonly registerConnection: (connectionId: string) => Effect.Effect<void>
    readonly unregisterConnection: (connectionId: string) => Effect.Effect<void>

    readonly publish: (message: string) => Effect.Effect<void>
    readonly subscribe: Stream.Stream<string>
  }
>()('StreamService') {
  public static live = Layer.effect(
    this,
    Effect.gen(function* () {
      const connections = yield* SynchronizedRef.make(
        MutableHashMap.empty<string, ActiveConnection>()
      )

      const registerConnection = Effect.fn(function* (connectionId: string) {
        yield* SynchronizedRef.updateEffect(connections, (map) =>
          Clock.currentTimeMillis.pipe(
            Effect.map((now) => {
              const activeConnection: ActiveConnection = {
                id: connectionId,
                lastActivityTimestamp: now,
              }

              return MutableHashMap.set(map, connectionId, activeConnection)
            }),
            Effect.tap(() =>
              Effect.logDebug(`Registered connection: ${connectionId}`)
            )
          )
        )
      })

      const unregisterConnection = Effect.fn(function* (connectionId: string) {
        yield* SynchronizedRef.updateEffect(connections, (map) => {
          const connection = MutableHashMap.get(map, connectionId)

          if (Option.isNone(connection)) return Effect.succeed(map)
          MutableHashMap.remove(map, connectionId)

          return Effect.logDebug(
            `Unregistered connection: ${connectionId}`
          ).pipe(Effect.as(map))
        })
      })

      const pubsub = yield* PubSub.unbounded<string>()

      const publish = (message: string) => PubSub.publish(pubsub, message)

      const subscribe = Stream.fromPubSub(pubsub)

      return {
        registerConnection,
        unregisterConnection,

        publish,
        subscribe,
      }
    })
  )
}

interface ActiveConnection {
  id: string
  lastActivityTimestamp: number
}
