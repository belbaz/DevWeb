"use client";

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SearchBar from "./searchBar";
import { useAuth } from './AuthContext';
import Box from '@mui/material/Box';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const { isAuthenticated, setIsAuthenticated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    const handleSearch = useCallback(async (query) => {
        if (!query || query.trim() === '') {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data);
            } else {
                console.error("Search API error:", res.status);
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error in search:", error);
            setSuggestions([]);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/logout", { 
                method: "POST",
                credentials: "include"
            });
            if (response.ok) {
                setIsAuthenticated(false);
                router.push("/login");
            }
        } catch (error) {
            console.error("Error while disconnecting:", error);
        }
    }, [router, setIsAuthenticated]);

    const showSearchBar = isAuthenticated && pathname === '/dashboard';

    return (
        <header className="header">
            <Link href="/" className="logo">MUSEHOME</Link>

            {showSearchBar && (
                <Box sx={{ 
                    position: "relative", 
                    flex: { xs: "0 1 auto", md: 1 },
                    maxWidth: { xs: 200, md: 400 },
                    mx: { xs: 2, md: 'auto' },
                    display: 'flex',
                    alignItems: 'center'
                }}>
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
                </Box>
            )}

            <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            </button>

            <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
                <Link href="/">Home</Link>
                {isAuthenticated ? (
                    <>
                        <Link href="/dashboard">Dashboard</Link>
                        <Link href="/settings">Settings</Link>
                        <a 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}
                            className="nav-link"
                        >
                            Logout
                        </a>
                    </>
                ) : (
                    <>
                        <Link href="/contact">Contact</Link>
                        <Link href="/login">Login</Link>
                        <Link href="/signup">Sign Up</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default memo(Header);
