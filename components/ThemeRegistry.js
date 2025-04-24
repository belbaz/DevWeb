"use client";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './emotionCache';

const clientSideEmotionCache = createEmotionCache();

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: "rgba(0,0,0,0.75)",
      paper: "rgba(20,20,20,0.95)",
    },
    primary: {
      main: "#fff",
      contrastText: "#0a0a0a"
    },
    secondary: {
      main: "#d4af37",
      contrastText: "#fff"
    },
    text: {
      primary: "#fff",
      secondary: "rgba(255,255,255,0.7)"
    }
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Cinzel',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Cinzel, serif',
      fontWeight: 400,
      letterSpacing: 4,
    },
    h2: {
      fontFamily: 'Cinzel, serif',
      fontWeight: 400,
      letterSpacing: 3,
    },
    h3: {
      fontFamily: 'Cinzel, serif',
      fontWeight: 400,
      letterSpacing: 2,
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 300,
      letterSpacing: 2,
      borderRadius: 0,
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          fontWeight: 300,
          padding: '1rem 2.5rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
} 