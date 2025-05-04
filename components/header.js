"use client";

import { useState, useCallback, memo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './searchBar';
import { useAuth } from './AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import UserIconMenu from './UserIconMenu';
import Box from '@mui/material/Box';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [userData, setUserData] = useState(null);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setHydrated(true);
    }, []);

    // Récupération des données utilisateur lorsque l'utilisateur est authentifié
    useEffect(() => {
        const fetchUserData = async () => {
            if (isAuthenticated) {
                try {
                    const response = await fetch('/api/user/checkUser', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUserData(null);
            }
        };
        
        fetchUserData();
    }, [isAuthenticated]);

    const rawIsMobile = useMediaQuery('(max-width:1440px)');
    const isMobile = hydrated && rawIsMobile;

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

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
                        {/* Navigation normale en mode desktop, cachée en mode mobile quand le menu n'est pas ouvert */}
                        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
                            <Link href="/">Home</Link>
                            {isAuthenticated && <Link href="/dashboard">Dashboard</Link>}
                            <Link href="/contact">Contact</Link>
                            <Link href="/about">About</Link>
                        </nav>

                        {/* Conteneur pour les contrôles de droite */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            zIndex: 1000
                        }}>
                            {/* Hamburger menu pour mobile - placé avant l'icône utilisateur */}
                            {isMobile && (
                                <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
                                    <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                                </button>
                            )}
                            
                            {/* Icône utilisateur avec menu déroulant - toujours placée en dernier */}
                            <UserIconMenu user={userData} />
                        </Box>
                    </>
                )}
            </div>
        </header>
    );
};

export default memo(Header);
