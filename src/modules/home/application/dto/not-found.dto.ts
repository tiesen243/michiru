import { Http } from "@/shared/http";
import * as Schema from "effect/Schema";
import * as Effect from "effect/Effect";

export class NotFoundDto extends Http.extend<NotFoundDto>("NotFoundDto")(
  {
    status: Schema.Number.pipe(Schema.withConstructorDefault(Effect.succeed(404))),
    message: Schema.String.pipe(Schema.withConstructorDefault(Effect.succeed("Not Found"))),
  },
  { httpApiStatus: 404 },
) {}
