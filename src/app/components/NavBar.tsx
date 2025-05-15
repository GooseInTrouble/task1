"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            MyApp
          </Link>
        </Typography>

        <Box sx={{ mr: 2 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            <Button color="inherit">Home</Button>
          </Link>
        </Box>
        {user && (
          <Button color="inherit" onClick={handleLogout}>
            Log Out
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
