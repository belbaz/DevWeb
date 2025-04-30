"use client";

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from "./searchBar";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSearch = async (query) => {
        if (!query) return setSuggestions([]);

        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data);
    };

    return (
        <header className="header">
            <Link href="/" className="logo">MUSEHOME</Link>

            <div style={{ position: "relative" }}>
                <SearchBar onSearch={handleSearch} />
                {suggestions.length > 0 && (
                    <ul className="search-suggestions">
                        {suggestions.map((item, index) => (
                            <li key={index}>
                                <strong>[{item.type}]</strong> {item.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

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
