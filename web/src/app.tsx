import { useSubscription } from '@tiesen/effect-tanstack-query/react'
import { api } from '@web/lib/api'

export function App() {
  const { status } = useSubscription(
    api.stream.events.subscriptionOptions(
      { params: { id: '1' } },
      { onData: console.log }
    )
  )

  return <main>{status}</main>
}

export default App
