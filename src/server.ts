import * as Layer from 'effect/Layer'
import { HttpServerResponse } from 'effect/unstable/http'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'
import * as HttpServer from 'effect/unstable/http/HttpServer'
import * as HttpApi from 'effect/unstable/httpapi/HttpApi'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'
import * as HttpApiScalar from 'effect/unstable/httpapi/HttpApiScalar'
import * as OpenApi from 'effect/unstable/httpapi/OpenApi'

import { HomeModule } from '@/modules/home/home.module'
import { NotFound } from '@/shared/http'

const homeModule = HomeModule()

class Api extends HttpApi.make('Api')
  .addHttpApi(homeModule.api)
  .annotateMerge(OpenApi.annotations({ title: 'My API', version: '1.0.0' })) {
  public static live = HttpApiBuilder.layer(Api, {
    openapiPath: '/openapi.json',
  }).pipe(Layer.provide([homeModule.live]), Layer.provide(HttpRouter.cors({})))
}

const DocsLive = HttpApiScalar.layer(Api, {
  path: '/docs',
  scalar: { theme: 'kepler' },
})

const NotFoundLive = HttpRouter.add(
  '*',
  '*',
  HttpServerResponse.json(new NotFound(), { status: 404 })
)

const { handler, dispose: _ } = HttpRouter.toWebHandler(
  Layer.mergeAll(Api.live, DocsLive, NotFoundLive).pipe(
    Layer.provide(HttpServer.layerServices)
  )
)

export default { fetch: handler }
export { Api }
