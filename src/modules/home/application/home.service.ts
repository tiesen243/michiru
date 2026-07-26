import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { HomeDto } from '@/modules/home/application/dto/home.dto'

export class HomeService extends Context.Service<
  HomeService,
  {
    readonly index: () => Effect.Effect<HomeDto>
  }
>()('HomeService') {
  public static live = Layer.succeed(
    this,
    this.of({
      index: Effect.fn(function* () {
        return HomeDto.make()
      }),
    })
  )
}
