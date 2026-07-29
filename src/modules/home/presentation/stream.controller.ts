import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

export class StreamController extends HttpApiGroup.make('stream')
  .add(
    HttpApiEndpoint.get('events', '/events', {
      success: Schema.String,
    })
  )
  .add(
    HttpApiEndpoint.post('emit', '/emit', {
      payload: Schema.Struct({
        message: Schema.String,
      }),
      success: Schema.Struct({
        success: Schema.Boolean,
      }),
    })
  ) {}
