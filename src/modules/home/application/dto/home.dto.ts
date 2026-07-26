import { Http } from "@/shared/http";
import * as Schema from "effect/Schema";
import * as Effect from "effect/Effect";

export class HomeDto extends Http.extend<HomeDto>("HomeDto")({
  message: Schema.String.pipe(Schema.withConstructorDefault(Effect.succeed("Hello, World!"))),
}) {}
