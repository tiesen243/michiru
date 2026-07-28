import { useMutation, useQuery } from '@tanstack/react-query'
import { createTanstackQueryProxy } from '@web/lib/api'
import * as ManagedRuntime from 'effect/ManagedRuntime'

import { ApiClient } from '@/client'

const runtime = ManagedRuntime.make(ApiClient.layer)
const api = createTanstackQueryProxy(runtime, ApiClient)

export function App() {
  const searchParams = new URLSearchParams(window.location.search)

  const { data, isLoading } = useQuery({
    ...api.home.index.queryOptions(),
  })

  const { data: hello, isLoading: isHelloLoading } = useQuery({
    ...api.home.hello.queryOptions({
      params: { name: searchParams.get('name') ?? 'World' },
      headers: { 'x-custom-header': 'cac' },
    }),
    select: (data) => data.message,
  })

  const keys = api.home.index.getQueryKey()

  const mutation = useMutation({
    ...api.home.create.mutationOptions(),
    onSuccess: (data) => console.log(data),
  })

  return (
    <main>
      <h1>Hello, World!</h1>
      <pre>{isLoading ? 'loading...' : JSON.stringify(data, null, 2)}</pre>

      <pre>
        {isHelloLoading ? 'loading...' : JSON.stringify(hello, null, 2)}
      </pre>

      <pre>{JSON.stringify(keys, null, 2)}</pre>

      <button onClick={() => mutation.mutate({ title: 'New Item' })}>
        Click me to create
      </button>
    </main>
  )
}

export default App
