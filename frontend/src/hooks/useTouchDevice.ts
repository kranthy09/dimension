'use client'

import { useEffect, useState } from 'react'

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - legacy support
        navigator.msMaxTouchPoints > 0
      )
    }

    setIsTouchDevice(checkTouchDevice())
  }, [])

  return isTouchDevice
}
