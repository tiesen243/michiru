import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { HomeDto } from '@/modules/home/application/dto/home.dto'

export class HomeController extends HttpApiGroup.make('home')
  .add(
    HttpApiEndpoint.get('index', '/', {
      success: HomeDto,
    })
  )

  .add(
    HttpApiEndpoint.get('hello', '/:name', {
      success: HomeDto,
      params: Schema.Struct({
        name: Schema.String,
      }),
    })
  )

  .add(
    HttpApiEndpoint.post('create', '/create', {
      success: HomeDto,

      payload: Schema.Struct({
        title: Schema.String,
      }),
    })
  ) {}
