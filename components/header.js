"use client";

import { useState, useCallback, memo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './searchBar';
import { useAuth } from './AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';


const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setHydrated(true);
    }, []);

    const rawIsMobile = useMediaQuery('(max-width:768px)');
    const isMobile = hydrated && rawIsMobile;

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
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
        <header className={`header ${isMobile && searchActive ? 'search-active' : ''}`}>
            <div className="left-zone">
                {!(isMobile && searchActive) && (
                    <Link href="/" className="logo">MUSEHOME</Link>
                )}
            </div>

            <div className={`center-zone ${searchActive ? 'centered-search' : ''}`}>
                {(!isMobile || searchActive) && (
                    <SearchBar
                        showFiltersButton
                        searchActive={searchActive}
                        setSearchActive={setSearchActive}
                    />
                )}
            </div>

            <div className="right-zone">
                {isMobile && !searchActive && (
                    <SearchBar
                        showFiltersButton={false}
                        searchActive={searchActive}
                        setSearchActive={setSearchActive}
                    />
                )}
                
                {!(isMobile && searchActive) && (
                    <>
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

                        <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
                            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default memo(Header);
