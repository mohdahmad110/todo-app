import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

export default function Home() {
  const router = useRouter()
  const auth = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (auth.isAuthenticated && auth.isEmailVerified) {
      router.replace('/todos')
    } else {
      router.replace('/auth/login')
    }
  }, [auth.isAuthenticated, auth.isEmailVerified, router])

  return null
}
