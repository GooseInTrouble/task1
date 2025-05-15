'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Box, Button, Container, TextField, Typography } from '@mui/material'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Your password has been updated successfully.')
      setTimeout(() => {
        router.push('auth/update-password') 
      }, 2500)
    }
  }

  return (
    <Container maxWidth="xs">
      <Box mt={10}>
        <Typography variant="h5" gutterBottom>Set New Password</Typography>
        {message ? (
          <Typography color="primary">{message}</Typography>
        ) : (
          <form onSubmit={handleUpdate}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </Container>
  )
}
