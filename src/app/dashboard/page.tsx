"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Box, Button, Container, Typography } from "@mui/material";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/auth/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box mt={10}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1">
          <strong>Email:</strong> {user.email}
        </Typography>
        <Typography variant="body1">
          <strong>User ID:</strong> {user.id}
        </Typography>
        <Typography variant="body1">
          <strong>Created At:</strong>{" "}
          {new Date(user.created_at).toLocaleString()}
        </Typography>

        <Box mt={4}>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
