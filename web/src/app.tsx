import { useMutation, useQuery } from '@tanstack/react-query'
import { createTanstackQueryProxy } from '@web/lib/api'
import * as ManagedRuntime from 'effect/ManagedRuntime'

import { ApiClient } from '@/client'
import { Api } from '@/server'

const runtime = ManagedRuntime.make(ApiClient.layer)
const api = createTanstackQueryProxy<typeof Api>()(runtime, ApiClient)

export function App() {
  const { data } = useQuery(api.home.index.queryOptions({ search: 'dsada' }))

  const mutation = useMutation(
    api.home.create.mutationOptions({
      onSuccess: console.log,
    })
  )

  console.log(api.home.create.mutationOptions())

  return (
    <main>
      <h1>Hello, World!</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <button onClick={() => mutation.mutate({ title: 'New Item' })}>
        Click me to create
      </button>
    </main>
  )
}

export default App
