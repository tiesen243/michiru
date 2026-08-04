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
        yield* SynchronizedRef.updateEffect(connections, (map) =>
          Clock.currentTimeMillis.pipe(
            Effect.flatMap((now) => {
              const existingOpt = MutableHashMap.get(map, connectionId)

              if (Option.isSome(existingOpt)) {
                const current = existingOpt.value
                const updated: StreamService.ActiveConnection = {
                  ...current,
                  refCount: current.refCount + 1,
                  lastActivityTimestamp: now,
                }
                MutableHashMap.set(map, connectionId, updated)
                return Effect.logInfo(
                  `Client joined room: ${connectionId} (refCount: ${updated.refCount})`
                ).pipe(Effect.as(map))
              } else {
                return PubSub.unbounded<string>().pipe(
                  Effect.map((pubsub) => {
                    const newConn: StreamService.ActiveConnection = {
                      connectionId,
                      refCount: 1,
                      lastActivityTimestamp: now,
                      pubsub,
                    }
                    MutableHashMap.set(map, connectionId, newConn)
                    return map
                  }),
                  Effect.tap(() =>
                    Effect.logInfo(
                      `Created new room: ${connectionId} (refCount: 1)`
                    )
                  )
                )
              }
            })
          )
        )
      })

      const unregister = Effect.fn(function* (connectionId: string) {
        yield* SynchronizedRef.updateEffect(connections, (map) => {
          const existingOpt = MutableHashMap.get(map, connectionId)

          if (Option.isNone(existingOpt)) return Effect.succeed(map)

          const activeConn = existingOpt.value
          const newRefCount = activeConn.refCount - 1

          if (newRefCount <= 0) {
            // Không còn client nào trong phòng -> Chỉ cần XÓA PHÒNG khỏi Map
            // Bỏ `PubSub.shutdown` để tránh làm đứt stream đột ngột gây ra lỗi releaseLock()
            MutableHashMap.remove(map, connectionId)
            return Effect.logDebug(
              `Room empty, removed room from map: ${connectionId}`
            ).pipe(Effect.as(map))
          } else {
            // Vẫn còn client khác -> Chỉ giảm refCount
            const updated: StreamService.ActiveConnection = {
              ...activeConn,
              refCount: newRefCount,
            }
            MutableHashMap.set(map, connectionId, updated)
            return Effect.logDebug(
              `Client left room: ${connectionId} (refCount: ${newRefCount})`
            ).pipe(Effect.as(map))
          }
        })
      })

      // Gửi tin nhắn vào đúng phòng chat theo connectionId
      const publish = (connectionId: string, message: string) =>
        SynchronizedRef.get(connections).pipe(
          Effect.flatMap((map) => {
            const connectionOpt = MutableHashMap.get(map, connectionId)
            if (Option.isNone(connectionOpt))
              return Effect.logWarning(
                `Failed to publish. Room not found or empty: ${connectionId}`
              ).pipe(Effect.as(false))

            const activeConn = connectionOpt.value
            return PubSub.publish(activeConn.pubsub, message)
          })
        )

      // Lắng nghe stream từ đúng phòng chat theo connectionId
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
    refCount: number
    lastActivityTimestamp: number
    pubsub: PubSub.PubSub<string>
  }
}
