import { useMutation, useQuery } from '@tanstack/react-query'
import { useSubscription } from '@web/hooks/use-subcription'
import { api } from '@web/lib/api'

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

  useSubscription({
    url: 'http://localhost:3000/events',
    queryKey: ['events'],

    onMessage: console.log,
  })

  const { data: messages = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => [],
  })

  return (
    <main>
      <h1>Hello, World!</h1>
      <pre>{isLoading ? 'loading...' : JSON.stringify(data, null, 2)}</pre>

      <pre>
        {isHelloLoading ? 'loading...' : JSON.stringify(hello, null, 2)}
      </pre>

      <pre>{JSON.stringify(keys, null, 2)}</pre>

      <pre>{JSON.stringify(messages, null, 2)}</pre>

      <button onClick={() => mutation.mutate({ title: 'New Item' })}>
        Click me to create
      </button>
    </main>
  )
}

export default App
