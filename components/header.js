import { AppBar, Link, Typography, Box } from "@mui/material";

export default function Header() {
  return (
    <header className="header">
      <a href="/" style={{ textDecoration: "none" }}>
        <h1 style={{ color: "white" }}>MuseHome</h1>
      </a>
      <nav>
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/contact">Contact</a>
        <a href="/login">Login</a>
        <a href="/signup">Sign Up</a>
      </nav>
    </header>
  );
}

export function MuiHeader() {
  const linkStyle = {
    color: "white",
    textDecoration: "none",
    margin: "0 15px",
    fontWeight: "bold",
    transition: "opacity 0.3s ease",
    opacity: 0.8,
    "&:hover": {
      opacity: 1,
    },
  };
  const h1Style = {
    margin: "0px",
    fontSize: "1.8rem",
    color: "white",
  };

  return (
    <AppBar sx={{
      position: "static", // doesnt ovearlap the content
      backgroundColor: '#00796b',
      color: 'white',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    }}>

      <Typography variant="h1" style={h1Style}>MuseHome</Typography>
      <Box>
        <Link sx={linkStyle} href="/">Home</Link>
        <Link sx={linkStyle} href="/dashboard">Dashboard</Link>
        <Link sx={linkStyle} href="/contact">Contact</Link>
        <Link sx={linkStyle} href="/login">Login</Link>
        <Link sx={linkStyle} href="/signup">Sign Up</Link>
      </Box>
    </AppBar>
  );
}
