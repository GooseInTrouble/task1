"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/auth/update-password", // АБО твоя продакшн-URL
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
      setMessage(
        "Password reset email has been sent. Please check your inbox."
      );
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={10}>
        <Typography variant="h5" gutterBottom>
          Reset Password
        </Typography>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            {error && (
              <Typography color="error" mt={1}>
                {error}
              </Typography>
            )}
            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
            </Box>
          </form>
        ) : (
          <Typography mt={2} color="primary">
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
}
