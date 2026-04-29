'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useCallback } from 'react'

/**
 * useGatedAction
 *
 * Wraps any action so it only fires when the user is authenticated.
 * If not logged in, opens the login modal instead.
 *
 * Usage:
 *   const handleAnalyse = useGatedAction(() => {
 *     // your existing analyse logic
 *   })
 *
 *   <button onClick={handleAnalyse}>Analyse</button>
 */
export function useGatedAction<T extends (...args: unknown[]) => unknown>(action: T) {
  const { user, openLoginModal } = useAuth()

  return useCallback((...args: Parameters<T>) => {
    if (!user) {
      openLoginModal()
      return
    }
    return action(...args)
  }, [user, openLoginModal, action])
}
