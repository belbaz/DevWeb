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
