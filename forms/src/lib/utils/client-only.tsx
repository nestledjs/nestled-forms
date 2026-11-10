'use client'

import { useEffect, useState, ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the post-mount flip is the purpose: children render only after hydration, never on the server
    setIsClient(true)
  }, [])

  return isClient ? <>{children}</> : <>{fallback}</>
}
