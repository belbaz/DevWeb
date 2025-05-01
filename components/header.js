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
        if (!query || query.trim() === "") {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

            if (!res.ok) throw new Error("Erreur serveur");

            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error("Erreur de recherche :", err);
            setSuggestions([]);
        }
    };


    return (
        <header className="header">
            <Link href="/" className="logo">MUSEHOME</Link>

            <div className="search-container">
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
