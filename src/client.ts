import { Api } from "@/server";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as Layer from "effect/Layer";
import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as Schedule from "effect/Schedule";
import { flow } from "effect/Function";

export class ApiClient extends Context.Service<ApiClient, HttpApiClient.ForApi<typeof Api>>()(
  "ApiClient",
) {
  static readonly layer = Layer.effect(
    ApiClient,
    HttpApiClient.make(Api, {
      transformClient: (client) =>
        client.pipe(
          HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("http://localhost:3000"))),
          HttpClient.retryTransient({ schedule: Schedule.exponential(100), times: 3 }),
        ),
    }),
  ).pipe(Layer.provide(FetchHttpClient.layer));
}

const program = Effect.gen(function* () {
  const api = yield* ApiClient;

  const home = yield* api.Home.home();

  yield* Effect.log(home);
});
Effect.runPromise(program.pipe(Effect.provide(ApiClient.layer)));
