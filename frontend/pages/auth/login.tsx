import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material'
import { apiClient } from '../../lib/apiClient'
import { setAuthState, setAccessToken, setRefreshToken } from '../../store/authSlice'

export default function Login() {
  const router = useRouter()
  const { email: initialEmail } = router.query
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: (initialEmail as string) || '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response: any = await apiClient.login(formData.email, formData.password)
      
      dispatch(setAccessToken(response.accessToken))
      dispatch(setRefreshToken(response.refreshToken))
      dispatch(
        setAuthState({
          user: response.user,
          isEmailVerified: true,
          isAuthenticated: true,
        })
      )

      setSuccess('Login successful! Redirecting to todos...')
      
      setTimeout(() => {
        router.push('/todos')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Login
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button
                color="primary"
                onClick={() => router.push('/auth/signup')}
                sx={{ textTransform: 'none' }}
              >
                Sign up
              </Button>
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              color="secondary"
              onClick={() => router.push('/auth/forgot-password')}
              sx={{ textTransform: 'none' }}
            >
              Forgot Password?
            </Button>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
