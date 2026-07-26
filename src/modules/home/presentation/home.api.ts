import { HomeController } from "@/modules/home/presentation/home.controller";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";
import * as Effect from "effect/Effect";
import { HomeService } from "@/modules/home/application/home.service";

export class HomeApi extends HttpApi.make("Api").add(HomeController) {
  public static live = HttpApiBuilder.group(
    this,
    "Home",
    Effect.fn(function* (handlers) {
      const homeService = yield* Effect.service(HomeService);

      return handlers
        .handle("home", () => homeService.home())
        .handle("not-found", () => homeService.notFound());
    }),
  );
}
