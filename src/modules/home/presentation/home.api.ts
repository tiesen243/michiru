import * as Effect from 'effect/Effect'
import * as HttpApi from 'effect/unstable/httpapi/HttpApi'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { HomeService } from '@/modules/home/application/home.service'
import { HomeController } from '@/modules/home/presentation/home.controller'

export class HomeApi extends HttpApi.make('Api').add(HomeController) {
  public static live = HttpApiBuilder.group(
    this,
    'home',
    Effect.fn(function* (handlers) {
      const homeService = yield* Effect.service(HomeService)

      return handlers
        .handle('index', homeService.index)
        .handle('create', homeService.create)
    })
  )
}
