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
import { setAuthState } from '../../store/authSlice'

export default function VerifyOtp() {
  const router = useRouter()
  const { email } = router.query
  const dispatch = useDispatch()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!email) {
      setError('Email not found. Please signup again.')
      return
    }

    try {
      const response = await apiClient.verifyOtp(email as string, otp)
      setSuccess('Email verified successfully! Redirecting to login...')
      
      setTimeout(() => {
        router.push(`/auth/login?email=${email}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 'bold' }}>
            Verify Email
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Enter the OTP sent to {email}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="OTP (6 digits)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="000000"
              margin="normal"
              inputProps={{ maxLength: 6 }}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              color="primary"
              onClick={() => router.push('/auth/signup')}
              sx={{ textTransform: 'none' }}
            >
              Back to Signup
            </Button>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
