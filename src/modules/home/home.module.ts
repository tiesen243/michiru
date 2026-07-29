import * as Layer from 'effect/Layer'

import { HomeService } from '@/modules/home/application/home.service'
import { StreamService } from '@/modules/home/application/stream.service'
import { HomeLive } from '@/modules/home/presentation/home.live'
import { StreamLive } from '@/modules/home/presentation/stream.live'

export const HomeModule = () => {
  const layer = Layer.mergeAll(HomeService.live, StreamService.live)

  const live = Layer.mergeAll(HomeLive, StreamLive)

  return {
    live: Layer.provide(live, layer),
  }
}
