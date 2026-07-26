import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { Http } from '@/shared/http'

export class HomeDto extends Http.extend<HomeDto>('HomeDto')({
  message: Schema.String.pipe(
    Schema.withConstructorDefault(Effect.succeed('Hello, World!'))
  ),
}) {}
