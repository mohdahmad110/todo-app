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
  InputAdornment,
  IconButton,
  Card,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
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
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

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

      // Store remember me flag and user data if checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('userData', JSON.stringify(response.user))
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('userData')
      }

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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F1419 0%, #1a242f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 4,
            backgroundColor: '#1a1f2e',
            backgroundImage: 'linear-gradient(180deg, rgba(26, 31, 46, 1) 0%, rgba(76, 45, 67, 0.2) 100%)',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
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
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#17A2B8',
                    '&.Mui-checked': {
                      color: '#FFD700',
                    },
                  }}
                />
              }
              label="Remember me"
              sx={{ mt: 2, mb: 1 }}
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

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button
                color="primary"
                onClick={() => router.push('/auth/signup')}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Sign up
              </Button>
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              color="secondary"
              onClick={() => router.push('/auth/forgot-password')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Forgot Password?
            </Button>
          </Typography>
        </Card>
      </Container>
    </Box>
  )
}
