import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import { HomeDto } from "@/modules/home/application/dto/home.dto";
import { NotFoundDto } from "@/modules/home/application/dto/not-found.dto";

export class HomeController extends HttpApiGroup.make("Home").add(
  HttpApiEndpoint.get("home", "/", {
    success: HomeDto,
  }),
  HttpApiEndpoint.get("not-found", "/*", {
    success: NotFoundDto,
  }),
) {}
