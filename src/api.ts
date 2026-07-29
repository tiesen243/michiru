import * as HttpApi from 'effect/unstable/httpapi/HttpApi'
import * as OpenApi from 'effect/unstable/httpapi/OpenApi'

import { HomeController } from '@/modules/home/presentation/home.controller'
import { StreamController } from '@/modules/home/presentation/stream.controller'

export class Api extends HttpApi.make('Api')
  .add(HomeController)
  .add(StreamController)
  .annotateMerge(OpenApi.annotations({ title: 'My API', version: '1.0.0' })) {}
