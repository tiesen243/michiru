import * as Layer from 'effect/Layer'
import { HttpServerResponse } from 'effect/unstable/http'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'
import * as HttpServer from 'effect/unstable/http/HttpServer'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'
import * as HttpApiScalar from 'effect/unstable/httpapi/HttpApiScalar'

import { Api } from '@/api'
import { HomeModule } from '@/modules/home/home.module'
import { NotFound } from '@/shared/http'

const homeModule = HomeModule()

const ApiLive = HttpApiBuilder.layer(Api, {
  openapiPath: '/openapi.json',
}).pipe(
  Layer.provide([homeModule.live]),
  Layer.provide(
    HttpRouter.cors({
      allowedOrigins: ['http://localhost:8000'],
      allowedHeaders: ['content-type', 'authorization', 'b3', 'traceparent'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
      credentials: true,
    })
  )
)

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
  Layer.mergeAll(ApiLive, DocsLive, NotFoundLive).pipe(
    Layer.provide(HttpServer.layerServices)
  )
)

export default { fetch: handler }
export { Api }
