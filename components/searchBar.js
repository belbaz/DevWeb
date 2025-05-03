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

export default function SearchBar({ showFiltersButton = true }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const debounceRef = useRef(null);
    const isMobile = useMediaQuery('(max-width:768px)');
    const router = useRouter();

    const fetchSuggestions = async (value) => {
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error("API error:", err);
            setSuggestions([]);
        }
    };

    const handleChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (value.trim().length === 0) {
                setSuggestions([]);
            } else {
                fetchSuggestions(value);
            }
        }, 300);
    }, []);

    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
    };

    const handleSuggestionClick = (item) => {
        if (item.type === "Utilisateur") {
            router.push(`/profile/${item.pseudo}`);
        } else if (item.type === "Pièce") {
            router.push(`/room/${item.id}`);
        }

        setQuery("");
        setSuggestions([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && suggestions.length === 1) {
            handleSuggestionClick(suggestions[0]);
        }
    };

    useEffect(() => {
        if (query.trim() === "") {
            setSuggestions([]);
        }
    }, [query]);

    return (
        <>
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
                    onKeyDown={handleKeyDown}
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
                        more filters
                    </Button>
                )}
            </Box>

            {query.trim() !== "" && suggestions.length > 0 && (
                <Box
                    sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        marginTop: "4px",
                        backgroundColor: "rgba(0,0,0,0.85)",
                        color: "white",
                        borderRadius: "4px",
                        zIndex: 999,
                        maxHeight: "240px",
                        overflow: "hidden",
                        boxSizing: "border-box",
                        maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
                    }}
                    component="ul"
                >
                    <Box
                        sx={{
                            overflowY: "auto",
                            maxHeight: "240px",
                            pr: 1,
                        }}
                    >
                        {suggestions.map((item, index) => {
                            const cleanedName = item.name.replace(/\s*\(.*?\)\s*/g, "");

                            return (
                                <Box
                                    component="li"
                                    key={index}
                                    onClick={() => handleSuggestionClick(item)}
                                    sx={{
                                        padding: "8px 12px",
                                        fontSize: "0.9rem",
                                        fontFamily: "var(--font-roboto)",
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: "rgba(255,255,255,0.1)",
                                        },
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                    }}
                                >
                                    {item.type === "Utilisateur" ? (
                                        <>
                                            <span style={{ fontWeight: "bold" }}>
                                                {cleanedName}
                                            </span>
                                            <span style={{ fontSize: "0.75rem", fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>
                                                {item.pseudo.replace(/[()]/g, "")}
                                            </span>
                                        </>
                                    ) : (
                                        <span>{cleanedName}</span>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </>
    );
}
