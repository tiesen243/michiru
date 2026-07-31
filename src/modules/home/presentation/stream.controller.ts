import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'
import * as HttpApiSchema from 'effect/unstable/httpapi/HttpApiSchema'

export class SSEError extends Schema.TaggedErrorClass<SSEError>()(
  'SSEError',
  {},
  { httpApiStatus: 500 }
) {}

export class StreamController extends HttpApiGroup.make('stream')
  .add(
    HttpApiEndpoint.get('events', '/events/:id', {
      params: Schema.Struct({
        id: Schema.String,
      }),
      success: HttpApiSchema.StreamSse({
        data: Schema.String,
        error: SSEError,
      }),
    })
  )
  .add(
    HttpApiEndpoint.post('emit', '/emit', {
      payload: Schema.Struct({
        id: Schema.String,
        message: Schema.String,
      }),
      success: Schema.Struct({
        success: Schema.Boolean,
      }),
      error: SSEError,
    })
  ) {}
