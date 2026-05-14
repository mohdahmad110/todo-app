import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Provider, useDispatch } from 'react-redux'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import store from '../store/store'
import { setAccessToken, setRefreshToken, setAuthState } from '../store/authSlice'
import { theme } from '../lib/theme'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initialize auth state from localStorage
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const userData = localStorage.getItem('userData')
    
    // If tokens exist, restore the session
    if (accessToken && refreshToken) {
      dispatch(setAccessToken(accessToken))
      dispatch(setRefreshToken(refreshToken))
      
      // Try to restore user data if available
      let user = null
      if (userData) {
        try {
          user = JSON.parse(userData)
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
      
      // Set authenticated state with or without user data
      dispatch(
        setAuthState({
          user,
          isEmailVerified: true,
          isAuthenticated: true,
        })
      )
    }
  }, [dispatch])

  return <>{children}</>
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppInitializer>
          <Component {...pageProps} />
        </AppInitializer>
      </ThemeProvider>
    </Provider>
  )
}
