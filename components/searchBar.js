"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    InputBase,
    IconButton,
    Button,
    useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Close";

export default function SearchBar({ onSearch, showFiltersButton = true }) {
    const [query, setQuery] = useState("");
    const debounceRef = useRef(null);
    const isMobile = useMediaQuery('(max-width:768px)');
    const router = useRouter();

    const handleChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (value.trim().length === 0) {
                onSearch?.(""); // vider suggestions si champ vide
            } else {
                onSearch?.(value);
            }
        }, 300);
    }, [onSearch]);

    const handleClear = () => {
        setQuery("");
        onSearch?.("");
    };

    // En cas de suppression rapide du texte, on vide les suggestions immédiatement
    useEffect(() => {
        if (query.trim() === "") {
            onSearch?.("");
        }
    }, [query]);

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 450,
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 1,
                overflow: 'hidden',
                height: 36,
                mt: isMobile ? 2 : 0,
            }}
        >
            <IconButton
                aria-label="search"
                sx={{
                    color: 'white',
                    height: '100%',
                    px: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 0,
                    '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                    },
                }}
            >
                <SearchIcon fontSize="small" />
            </IconButton>

            <InputBase
                placeholder="Search..."
                value={query}
                onChange={handleChange}
                sx={{
                    ml: 1,
                    flex: 1,
                    color: 'white',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-roboto)',
                    letterSpacing: 1,
                    '& input::placeholder': {
                        color: 'rgba(255,255,255,0.6)',
                        opacity: 1
                    }
                }}
                inputProps={{ 'aria-label': 'search input' }}
            />

            {query && (
                <IconButton
                    onClick={handleClear}
                    aria-label="clear"
                    sx={{
                        color: 'white',
                        height: '100%',
                        px: 1.2,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 0,
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.25)',
                        },
                    }}
                >
                    <ClearIcon fontSize="small" />
                </IconButton>
            )}

            {showFiltersButton && (
                <Button
                    onClick={() => router.push('/filters')}
                    sx={{
                        height: '100%',
                        px: 1.5,
                        borderRadius: 0,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-roboto)',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.25)',
                        },
                    }}
                >
                    + de filtres
                </Button>
            )}
        </Box>
    );
}
