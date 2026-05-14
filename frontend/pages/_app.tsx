import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Provider, useDispatch } from 'react-redux'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import store from '../store/store'
import { setAccessToken, setRefreshToken } from '../store/authSlice'

const theme = createTheme()

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initialize auth state from localStorage
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (accessToken) {
      dispatch(setAccessToken(accessToken))
    }
    if (refreshToken) {
      dispatch(setRefreshToken(refreshToken))
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
