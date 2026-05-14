import { useEffect } from 'react'
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

    useEffect(() => {
      if (!auth.isAuthenticated) {
        router.replace('/auth/login')
        return
      }

      if (requiredVerification && !auth.isEmailVerified) {
        router.replace('/auth/verify-otp')
        return
      }
    }, [auth.isAuthenticated, auth.isEmailVerified, router])

    if (!auth.isAuthenticated) {
      return null
    }

    if (requiredVerification && !auth.isEmailVerified) {
      return null
    }

    return <Component {...props} />
  }
}
