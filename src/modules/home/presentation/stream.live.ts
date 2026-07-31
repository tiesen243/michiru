import * as Effect from 'effect/Effect'
import * as Schedule from 'effect/Schedule'
import * as Stream from 'effect/Stream'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { StreamService } from '@/modules/home/application/stream.service'

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
            Stream.succeed(`data: heartbeat\n\n`),
            Schedule.spaced('15 seconds')
          )

          const messageStream = streamService.subscribe(id).pipe(
            Stream.map((message) =>
              typeof message === 'string' ? message : JSON.stringify(message)
            ),
            Stream.map((message) => `data: ${JSON.stringify(message)}\n\n`)
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
            },
          })
        })
      )

      .handle(
        'emit',
        Effect.fn(function* ({ payload: { id, message } }) {
          yield* streamService.publish(id, message)

          return { success: true }
        })
      )
  })
)
