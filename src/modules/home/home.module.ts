import { HomeService } from "@/modules/home/application/home.service";
import { HomeApi } from "@/modules/home/presentation/home.api";
import * as Layer from "effect/Layer";

export const HomeModule = () => {
  const layer = Layer.mergeAll(HomeService.live);

  return {
    api: HomeApi,

    live: HomeApi.live.pipe(Layer.provide(layer)),
  };
};
