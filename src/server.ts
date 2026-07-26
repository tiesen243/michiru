import * as Layer from "effect/Layer";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";
import * as HttpApiScalar from "effect/unstable/httpapi/HttpApiScalar";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as OpenApi from "effect/unstable/httpapi/OpenApi";

import { HomeModule } from "@/modules/home/home.module";
import { HttpServer } from "effect/unstable/http";

const homeModule = HomeModule();

const Api = HttpApi.make("Api")
  .addHttpApi(homeModule.api)
  .annotateMerge(
    OpenApi.annotations({
      title: "My API",
    }),
  );

const ApiLive = HttpApiBuilder.layer(Api, { openapiPath: "/openapi.json" }).pipe(
  Layer.provide([homeModule.live]),
);

const DocsLive = HttpApiScalar.layer(Api, { path: "/docs", scalar: { theme: "kepler" } });

const Routes = Layer.mergeAll(ApiLive, DocsLive);

const { handler } = HttpRouter.toWebHandler(Routes.pipe(Layer.provide(HttpServer.layerServices)));

export { Api };
export default {
  fetch: handler,
};

// HttpRouter.serve(Layer.mergeAll(ApiLive, DocsLive))
//   .pipe(Layer.provide(BunHttpServer.layer({ port: 3000 })))
//   .pipe(Layer.launch)
//   .pipe(BunRuntime.runMain);
