"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    InputBase,
    IconButton,
    useMediaQuery,
    ClickAwayListener,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";

export default function SearchBar({ showFiltersButton = true, searchActive, setSearchActive }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [hovered, setHovered] = useState(false);
    const debounceRef = useRef(null);
    const isMobile = useMediaQuery("(max-width:1440px)");
    const router = useRouter();

    const fetchSuggestions = async (value) => {
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
            if (!res.ok) throw new Error("Erreur API");
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error("Erreur API :", err);
            setSuggestions([]);
        }
    };

    const handleChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

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
        } else if (item.type === "Objet") {
            router.push(`/objectInstance/${item.id}`);
        } else if (item.type === "Exposition") {
            router.push(`/expoInstance/${item.id}`);
        }

        setQuery("");
        setSuggestions([]);
        if (isMobile && setSearchActive) setSearchActive(false);
    };



    const handleKeyDown = (e) => {
        if (e.key === "Enter" && suggestions.length === 1) {
            handleSuggestionClick(suggestions[0]);
        }
    };

    const toggleSearchActive = () => {
        if (isMobile && setSearchActive) {
            setSearchActive((prev) => !prev);
        }
    };

    useEffect(() => {
        if (query.trim() === "") {
            setSuggestions([]);
        }
    }, [query]);

    const searchBox = (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                maxWidth: 450,
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.08)",
                height: 36,
                borderRadius: 0,
                flex: 1,
                zIndex: 1000,
                mx: !isMobile || searchActive ? "auto" : 0,
            }}
        >
            <IconButton
                aria-label="search"
                sx={{
                    color: "white",
                    height: "100%",
                    px: 1.5,
                    borderRadius: 0,
                }}
                disabled
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
                    color: "white",
                    fontSize: "0.9rem",
                    fontFamily: "var(--font-roboto)",
                    letterSpacing: 1,
                    "& input::placeholder": {
                        color: "rgba(255,255,255,0.6)",
                        opacity: 1,
                    },
                }}
                inputProps={{ "aria-label": "search input" }}
                autoFocus={isMobile}
            />

            {query && (
                <IconButton
                    onClick={handleClear}
                    aria-label="clear"
                    sx={{
                        color: "white",
                        height: "100%",
                        px: 1.2,
                        borderRadius: 0,
                    }}
                >
                    <ClearIcon fontSize="small" />
                </IconButton>
            )}

            {showFiltersButton && (
                <Box
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    sx={{
                        height: "100%",
                        px: 1.5,
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        backgroundColor: "rgba(255,255,255,0.08)",
                        "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.12)",
                        },
                    }}
                    onClick={() => router.push("/filters")}
                >
                    <TuneIcon
                        sx={{
                            color: "white",
                            fontSize: "1.1rem",
                            mr: hovered && !isMobile ? 1 : 0,
                            transition: "margin 0.2s ease",
                        }}
                    />
                    {!isMobile && hovered && (
                        <span
                            style={{
                                color: "white",
                                fontSize: "0.85rem",
                                fontFamily: "var(--font-roboto)",
                                whiteSpace: "nowrap",
                            }}
                        >
              more filters
            </span>
                    )}
                </Box>
            )}
        </Box>
    );

    return (
        <ClickAwayListener
            onClickAway={() => {
                if (isMobile && searchActive && setSearchActive) setSearchActive(false);
            }}
        >
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Box sx={{ position: "relative", width: "100%", maxWidth: 450 }}>
                    {!isMobile || searchActive ? (
                        searchBox
                    ) : (
                        <IconButton
                            onClick={toggleSearchActive}
                            aria-label="Search"
                            sx={{ color: "white", ml: "auto", padding: 1 }}
                        >
                            <SearchIcon />
                        </IconButton>
                    )}

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
                                borderRadius: 0,
                                zIndex: 999,
                                maxHeight: "240px",
                                overflow: "hidden",
                                maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
                                WebkitMaskImage:
                                    "linear-gradient(to bottom, black 85%, transparent 100%)",
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
                                                    <span style={{ fontWeight: "bold" }}>{cleanedName}</span>
                                                    <span
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            fontStyle: "italic",
                                                            color: "rgba(255,255,255,0.7)",
                                                        }}
                                                    >
                            {item.pseudo.replace(/[()]/g, "")}
                          </span>
                                                </>
                                            ) : (
                                                <span style={{ fontWeight: item.type === "Objet" ? "bold" : "normal" }}>{cleanedName}</span>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </ClickAwayListener>
    );
}
