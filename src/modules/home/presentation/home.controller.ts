import { Schema } from 'effect'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { HomeDto } from '@/modules/home/application/dto/home.dto'
import { Http } from '@/shared/http'

export class HomeController extends HttpApiGroup.make('home')
  .add(
    HttpApiEndpoint.get('index', '/', {
      success: HomeDto,
      error: Http,
    })
  )

  .add(
    HttpApiEndpoint.get('hello', '/:name', {
      success: HomeDto,
      headers: Schema.Struct({
        'x-custom-header': Schema.String,
      }),
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
