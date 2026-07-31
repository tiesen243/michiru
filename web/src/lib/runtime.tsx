import { ApiClient } from '@web/lib/api.client'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import * as React from 'react'

const createLayer = () => Layer.mergeAll(ApiClient.live)

const RuntimeContext = React.createContext<ManagedRuntime.ManagedRuntime<
  Layer.Success<ReturnType<typeof createLayer>>,
  never
> | null>(null)

const useRuntime = () => {
  const context = React.use(RuntimeContext)
  if (!context)
    throw new Error('useRuntime must be used within a RuntimeProvider')
  return context
}

function RuntimeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [runtime] = React.useState(() => ManagedRuntime.make(createLayer()))

  const value = React.useMemo(() => runtime, [runtime])

  return <RuntimeContext value={value}>{children}</RuntimeContext>
}

export { RuntimeProvider, useRuntime }
