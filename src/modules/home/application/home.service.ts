import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { HomeDto } from "@/modules/home/application/dto/home.dto";
import { NotFoundDto } from "@/modules/home/application/dto/not-found.dto";

export class HomeService extends Context.Service<
  HomeService,
  {
    readonly home: () => Effect.Effect<HomeDto>;
    readonly notFound: () => Effect.Effect<NotFoundDto>;
  }
>()("HomeService") {
  public static live = Layer.succeed(
    this,
    this.of({
      home: Effect.fn(function* () {
        return HomeDto.make();
      }),

      notFound: Effect.fn(function* () {
        return NotFoundDto.make();
      }),
    }),
  );
}
