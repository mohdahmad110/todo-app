import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredVerification: boolean = true
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter()
    const auth = useSelector((state: RootState) => state.auth)
    const [hasCheckedStorage, setHasCheckedStorage] = useState(false)
    const [hasStoredSession, setHasStoredSession] = useState(false)

    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      setHasStoredSession(Boolean(accessToken && refreshToken))
      setHasCheckedStorage(true)
    }, [])

    useEffect(() => {
      if (!hasCheckedStorage) {
        return
      }

      if (!auth.isAuthenticated && !hasStoredSession) {
        router.replace('/auth/login')
        return
      }

      if (auth.isAuthenticated && requiredVerification && !auth.isEmailVerified) {
        router.replace('/auth/verify-otp')
        return
      }
    }, [
      auth.isAuthenticated,
      auth.isEmailVerified,
      hasCheckedStorage,
      hasStoredSession,
      requiredVerification,
      router,
    ])

    if (!hasCheckedStorage) {
      return null
    }

    // Wait for AppInitializer to hydrate auth state if tokens are already present.
    if (!auth.isAuthenticated && hasStoredSession) {
      return null
    }

    if (!auth.isAuthenticated) {
      return null
    }

    if (requiredVerification && !auth.isEmailVerified) {
      return null
    }

    return <Component {...props} />
  }
}
