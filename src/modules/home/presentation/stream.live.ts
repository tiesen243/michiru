import * as Effect from 'effect/Effect'
import * as Stream from 'effect/Stream'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { StreamService } from '@/modules/home/application/stream.service'

const textEncoder = new TextEncoder()

export const StreamLive = HttpApiBuilder.group(
  Api,
  'stream',
  Effect.fn(function* (handlers) {
    const streamService = yield* StreamService

    return handlers
      .handle(
        'events',
        Effect.fn(function* () {
          const connectionId = crypto.randomUUID()

          const stream = Stream.fromEffect(
            streamService.registerConnection(connectionId)
          ).pipe(
            Stream.flatMap(() =>
              streamService.subscribe
                .pipe(
                  Stream.map((message) => {
                    const payload = JSON.stringify({ connectionId, message })
                    return `data: ${payload}\n\n`
                  })
                )
                .pipe(Stream.map((chunk) => textEncoder.encode(chunk)))
            ),
            Stream.ensuring(streamService.unregisterConnection(connectionId))
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
        Effect.fn(function* ({ payload }) {
          yield* streamService.publish(payload.message)

          return { success: true }
        })
      )
  })
)
