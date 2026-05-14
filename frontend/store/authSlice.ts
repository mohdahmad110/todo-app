import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isEmailVerified: boolean
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isEmailVerified: false,
  loading: false,
  error: null,
  isAuthenticated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<Partial<AuthState>>) => {
      return { ...state, ...action.payload }
    },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isEmailVerified = false
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('rememberMe')
      localStorage.removeItem('userData')
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      localStorage.setItem('accessToken', action.payload)
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload
      localStorage.setItem('refreshToken', action.payload)
    },
  },
})

export const { setAuthState, clearAuth, setAccessToken, setRefreshToken } = authSlice.actions
export default authSlice.reducer
