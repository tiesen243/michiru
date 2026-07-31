import { useQuery } from '@tanstack/react-query'
import { useSubscription } from '@tiesen/effect-tanstack-query/react'
import { useApi } from '@web/lib/api'
import * as React from 'react'

export function App() {
  const [messages, setMessages] = React.useState<string[]>([])
  const api = useApi()

  const { status } = useSubscription(
    api.stream.events.subscriptionOptions(
      { params: { id: '1' } },
      {
        onData: (data) => setMessages((prev) => [...prev, data]),
        onError: (e) => console.error(e.message),
      }
    )
  )

  const { data } = useQuery(api.home.index.queryOptions())

  return (
    <main>
      {status}

      <pre>{JSON.stringify(messages, null, 2)}</pre>

      <pre>{JSON.stringify(data.message, null, 2)}</pre>
    </main>
  )
}

export default App
