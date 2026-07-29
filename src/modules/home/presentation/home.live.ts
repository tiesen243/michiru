import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { HomeService } from '@/modules/home/application/home.service'

export const HomeLive = HttpApiBuilder.group(
  Api,
  'home',
  Effect.fn(function* (handlers) {
    const homeService = yield* Effect.service(HomeService)

    return handlers
      .handle('index', homeService.index)
      .handle('hello', homeService.hello)
      .handle('create', homeService.create)
  })
)
