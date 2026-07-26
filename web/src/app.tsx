import { useQuery } from '@tanstack/react-query'
import { runtime } from '@web/main'
import { Effect } from 'effect'

import { ApiClient } from '@/client'

export function App() {
  const { data } = useQuery({
    queryKey: ['home'],
    queryFn: () =>
      runtime.runPromise(
        Effect.gen(function* () {
          const api = yield* ApiClient
          return yield* api.home.index()
        })
      ),
  })

  return (
    <main>
      <h1>Hello, World!</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  )
}

export default App
