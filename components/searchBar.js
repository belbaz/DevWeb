"use client";
import { useState, useRef, useCallback } from "react";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import "../styles/searchBar.css";

export default function SearchBar({ onSearch, showFiltersButton = true }) {
    const [query, setQuery] = useState("");
    const debounceTimerRef = useRef(null);
    const isMobile = useMediaQuery('(max-width:768px)');

    // Fonction optimisée pour gérer les changements de recherche
    const handleQueryChange = useCallback((e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        
        // Annuler le timer précédent si existant
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Définir un nouveau timer pour la recherche
        debounceTimerRef.current = setTimeout(() => {
            if (onSearch) {
                onSearch(newQuery);
            }
        }, 300);
    }, [onSearch]);

    return (
        <Box className="search-bar-container">
            <TextField
                placeholder={isMobile ? "Search" : "Search..."}
                value={query}
                onChange={handleQueryChange}
                variant="filled"
                size="small"
                fullWidth
                InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon 
                                sx={{ 
                                    color: 'rgba(255, 255, 255, 0.7)', 
                                    ml: isMobile ? 0.5 : 1,
                                    fontSize: isMobile ? '1.2rem' : '1.5rem'
                                }} 
                            />
                        </InputAdornment>
                    ),
                    sx: {
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 0,
                        height: '36px',
                        '& .MuiFilledInput-input': {
                            paddingLeft: isMobile ? '8px' : '16px',
                            paddingTop: '6px',
                            paddingBottom: '6px',
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255, 255, 255, 0.6)',
                            opacity: 1,
                        },
                        '& .MuiInputAdornment-root': {
                            marginTop: '0 !important', // Override MUI's default margin
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        }
                    }
                }}
                sx={{
                    '& .MuiFilledInput-root': {
                        borderRadius: 0,
                    }
                }}
            />
        </Box>
    );
}
