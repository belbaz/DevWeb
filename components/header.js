"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <Link href="/" className="logo">MUSEHOME</Link>

            <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            </button>

            <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
                <Link href="/">Home</Link>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/login">Login</Link>
                <Link href="/signup">Sign Up</Link>
            </nav>
        </header>
    );
}
