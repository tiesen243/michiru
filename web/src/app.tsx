import { useMutation, useQuery } from '@tanstack/react-query'
import { createTanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'
import { ApiClient, runtime } from '@web/lib/api'

const api = createTanstackQueryOptionsProxy(ApiClient, runtime)

export function App() {
  const searchParams = new URLSearchParams(window.location.search)

  const { data, isLoading } = useQuery({
    ...api.home.index.queryOptions(),
  })

  const { data: hello, isLoading: isHelloLoading } = useQuery({
    ...api.home.hello.queryOptions({
      params: { name: searchParams.get('name') ?? 'World' },
    }),
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
