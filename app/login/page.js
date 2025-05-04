"use client";

import React, { useEffect, useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Rolling from '../../components/rolling';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { useAuth } from '../../components/AuthContext';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingCookies, setloadingCookies] = useState(false);
  const [msgError, setMsgError] = useState(null);

  useEffect(() => { // disable scroll on login page only
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "visible";
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/user/checkUser", {
        method: "POST"
      });
      if (response.ok) {
        setloadingCookies(true);
        setIsAuthenticated(true);
        router.push("/dashboard");
      } else {
        const data = await response.json();
        if (data.invalidToken) {
          setMsgError("Token expired");
          console.log("invalid token:", data.error);
        } else if (data.noToken) {
          console.log("No token");
        } else {
          setMsgError(data.error || "Unknown error");
          console.log("API error :", data.error);
        }
      }
    } catch (error) {
      console.error("Error while checking the token :", error);
      setMsgError("Error while connecting, please try again");
    }
  };

  useEffect(() => {
    const initialError = searchParams.get("initialMsgError");
    if (initialError) setMsgError(initialError);
    checkAuth();
  }, []);

  useEffect(() => {
    const error = searchParams.get("msgError");
    if (error) {
      setMsgError(decodeURIComponent(error));
      setTimeout(() => setMsgError(null), 5000);
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const idf = event.target.idf.value;
    const mdp = event.target.mdp.value;

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idf, mdp }),
      credentials: "include",
    });

    const data = await response.json();
    setIsLoading(false);

    if (response.ok) {
      setIsAuthenticated(true);
      router.push("/dashboard");
    } else {
      setMsgError(data.error || "Unknown error");
    }
  };

  return (
    <Box sx={{
      background: 'none',
      height: '100vh',
      margin: 0,
    }}>
      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'black',
          borderRadius: 0,
          boxShadow: 6,
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h3" align="center" sx={{ mb: 2, fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: 3, color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
          Log in
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="on">
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Username"
              name="idf"
              id="idf"
              placeholder="Your Username"
              variant="outlined"
              fullWidth
              autoComplete="username"
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.8)' } }}
              InputProps={{
                style: {
                  color: 'white',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 0,
                },
              }}
              sx={{
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px rgb(20, 20, 20) inset !important',
                  WebkitTextFillColor: 'white !important',
                  caretColor: 'white'
                }
              }}
              onFocus={() => setMsgError(null)}
              required
            />
            <TextField
              label="Password"
              name="mdp"
              id="mdp"
              placeholder="Your Password"
              type="password"
              variant="outlined"
              fullWidth
              autoComplete="current-password"
              slotProps={{
                inputLabel: {
                  style: { color: 'rgba(255,255,255,0.8)' }
                },
                input: {
                  style: {
                    color: 'white',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 0,
                  }
                }
              }}
              sx={{
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px rgb(20, 20, 20) inset !important',
                  WebkitTextFillColor: 'white !important',
                  caretColor: 'white'
                }
              }}
              onFocus={() => setMsgError(null)}
              required
            />
            <Button
              variant="text"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'right',
                fontSize: 13,
                textTransform: 'none',
                transition: 'color 0.3s, text-decoration 0.3s',
                '&:hover': {
                  color: '#ffffff', backgroundColor: 'transparent'
                },
              }}
              onClick={() => router.replace("/reset")}
            >
              Forgotten password?
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 300,
                fontSize: 18,
                letterSpacing: 2,
                borderRadius: 0,
                py: 1.5,
                mt: 1,
                bgcolor: 'rgba(255,255,255,0.12)',
                color: 'white',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.22)',
                  color: 'white',
                },
              }}
              disabled={isLoading}
            >
              {isLoading ? Rolling(40, 40, "#fff") : "Log in"}
            </Button>
            {msgError && (
              <Typography color="error" align="center" sx={{ mt: 1, fontSize: 16 }}>
                {msgError}
              </Typography>
            )}
          </Box>
        </form>
      </Box>
    </Box>
  );
}
