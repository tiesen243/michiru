import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

export type Status = 'CONNECTING' | 'OPEN' | 'CLOSED'

interface UseSubcriptionProps<T> {
  url: string
  queryKey: unknown[]

  onMessage?: (data: T) => void
  onError?: (error: Event) => void
}

export function useSubscription<T>({
  url,
  queryKey,
  onMessage,
  onError,
}: UseSubcriptionProps<T>) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<Status>('CLOSED')

  const eventSourceRef = useRef<EventSource | null>(null)
  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onMessageRef.current = onMessage
    onErrorRef.current = onError
  }, [onMessage, onError])

  const close = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setStatus('CLOSED')
    }
  }, [])

  const connect = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close()

    setStatus('CONNECTING')
    const eventSource = new EventSource(url, { withCredentials: true })
    eventSourceRef.current = eventSource

    eventSource.onopen = () => setStatus('OPEN')

    eventSource.onmessage = (event) => {
      try {
        const newMessage: T = JSON.parse(event.data)

        queryClient.setQueryData<T[]>(queryKey, (oldData = []) => {
          return [...oldData, newMessage]
        })

        onMessageRef.current?.(newMessage)
      } catch {}
    }

    eventSource.onerror = (error) => {
      setStatus('CONNECTING')
      onErrorRef.current?.(error)
    }
  }, [url, queryKey, queryClient])

  const reconnect = useCallback(() => {
    connect()
  }, [connect])

  useEffect(() => {
    connect()

    return close
  }, [connect, close])

  return { status, connect, close, reconnect }
}
