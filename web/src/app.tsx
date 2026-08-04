import { useSubscription } from '@tiesen/effect-tanstack-query/react'
import { api } from '@web/lib/runtime'
import * as React from 'react'

export function App() {
  const [messages, setMessages] = React.useState<string[]>([])

  const subscription = useSubscription(
    api.stream.events.subscriptionOptions(
      { params: { id: '1' } },
      {
        autoReconnect: '3 seconds',
        onStarted: () => console.log('subscription started'),
        onData: (data) => setMessages((prev) => [...prev, data]),
        onError: (e) => console.error(e.message),
        onConnectionChange: console.log,
      }
    )
  )

  return (
    <main>
      <pre>{JSON.stringify(subscription, null, 2)}</pre>
      <button onClick={() => subscription.reset()}>Reset</button>
      <pre>{JSON.stringify(messages, null, 2)}</pre>
    </main>
  )
}

export default App
