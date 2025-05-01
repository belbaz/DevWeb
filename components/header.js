"use client";

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './searchBar';
import { useAuth } from './AuthContext';
import {
    Box,
    Typography,
    Button,
    IconButton
} from '@mui/material';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const { isAuthenticated, setIsAuthenticated } = useAuth();
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

    return (
        <Box component="header" sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 300,
            backdropFilter: 'blur(14px)',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
        }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
                <Typography variant="h5" sx={{
                    fontFamily: 'var(--font-cinzel)',
                    color: 'rgba(255, 255, 255, 0.95)',
                    letterSpacing: 3,
                    '&:hover': { color: 'white' }
                }}>
                    MUSEHOME
                </Typography>
            </Link>

            <Box sx={{
                position: "relative",
                flex: 1,
                maxWidth: 450,
                mx: 3,
                display: "flex",
                alignItems: "center"
            }}>
                <SearchBar onSearch={handleSearch} showFiltersButton />
                {suggestions.length > 0 && (
                    <Box
                        component="ul"
                        sx={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            width: "100%",
                            marginTop: "4px",
                            backgroundColor: "rgba(0,0,0,0.85)",
                            color: "white",
                            listStyle: "none",
                            padding: "6px 0",
                            borderRadius: "4px",
                            zIndex: 999,
                            boxSizing: "border-box"
                        }}
                    >
                        {suggestions.map((item, index) => (
                            <Box
                                component="li"
                                key={index}
                                sx={{
                                    padding: "8px 12px",
                                    fontSize: "0.9rem",
                                    fontFamily: "var(--font-roboto)",
                                    cursor: "default",
                                    "&:hover": {
                                        backgroundColor: "rgba(255,255,255,0.1)",
                                    }
                                }}
                            >
                                <strong>[{item.type}]</strong> {item.name}
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            <IconButton
                onClick={toggleMenu}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    color: 'white',
                    zIndex: 101
                }}
                aria-label="Menu"
            >
                <Box sx={{
                    width: 30,
                    height: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&::before, &::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transition: 'all 0.3s ease'
                    },
                    '&::before': { top: -8 },
                    '&::after': { bottom: -8 }
                }} />
            </IconButton>

            <Box component="nav" sx={{
                display: { xs: isMenuOpen ? 'flex' : 'none', md: 'flex' },
                alignItems: 'center',
                gap: 3,
                position: { xs: 'fixed', md: 'static' },
                top: 0,
                right: 0,
                width: { xs: '100%', md: 'auto' },
                height: { xs: '100vh', md: 'auto' },
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'center',
                backgroundColor: { xs: 'rgba(0, 0, 0, 0.95)', md: 'transparent' },
                backdropFilter: { xs: 'blur(14px)', md: 'none' },
                zIndex: 100,
                transition: 'right 0.3s ease'
            }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
                {isAuthenticated ? (
                    <>
                        <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                        <Link href="/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
                        <Button
                            onClick={handleLogout}
                            sx={{
                                color: 'white',
                                textTransform: 'none'
                            }}
                        >
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</Link>
                        <Link href="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
                        <Link href="/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default memo(Header);
