import * as Effect from 'effect/Effect'
import * as Schedule from 'effect/Schedule'
import * as Stream from 'effect/Stream'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { StreamService } from '@/modules/home/application/stream.service'
import { SSEError } from '@/modules/home/presentation/stream.controller'

export const StreamLive = HttpApiBuilder.group(
  Api,
  'stream',
  Effect.fn(function* (handlers) {
    const streamService = yield* StreamService

    return handlers
      .handle(
        'events',
        Effect.fn(function* ({ params: { id } }) {
          yield* streamService.register(id)

          const heartbeatStream = Stream.repeat(
            Stream.succeed(':keep-alive\n\n'),
            Schedule.spaced('15 seconds')
          )

          const messageStream = streamService.subscribe(id).pipe(
            Stream.mapEffect((message) =>
              message === 'stream-error'
                ? Effect.fail(new SSEError())
                : Effect.succeed(message)
            ),
            Stream.map((message) => `data:${message}\n\n`)
          )

          const stream = Stream.merge(heartbeatStream, messageStream).pipe(
            Stream.ensuring(streamService.unregister(id)),
            Stream.encodeText
          )

          return HttpServerResponse.stream(stream, {
            contentType: 'text/event-stream',
            headers: {
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
              'X-Accel-Buffering': 'no',
            },
          })
        })
      )

      .handle(
        'emit',
        Effect.fn(function* ({ payload: { id, message } }) {
          if (message === 'emit-error')
            return yield* Effect.fail(new SSEError())

          yield* streamService.publish(id, message)

          return { success: true }
        })
      )
  })
)
