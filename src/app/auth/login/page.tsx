'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Box, Button, Container, TextField, Typography, Link } from '@mui/material'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleLogin = async () => {
    setError('')

    if (!validateEmail(email)) {
      setError('Please enter a valid email')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    const { error: supabaseError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (supabaseError) {
      if (supabaseError.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password')
      } else if (supabaseError.message.includes('User not found')) {
        setError('No user found with this email')
      } else {
        setError(supabaseError.message)
      }
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Container maxWidth="xs">
      <Box mt={10}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
        />
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Box mt={2}>
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
        <Box mt={1} textAlign="right">
          <Link href="/auth/reset-password" underline="hover" variant="body2">
            Forgot password?
          </Link>
        </Box>
        <Box mt={2}>
          <Typography>
            Don't have an account? <Link href="/auth/register" underline="hover">Register here</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
