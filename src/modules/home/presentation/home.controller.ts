import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { HomeDto } from '@/modules/home/application/dto/home.dto'

export class HomeController extends HttpApiGroup.make('home').add(
  HttpApiEndpoint.get('index', '/', {
    success: HomeDto,
  })
) {}
