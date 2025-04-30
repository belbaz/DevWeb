"use client";
import { useState, useEffect } from "react";
import "../styles/searchBar.css";

export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState("");

    // Lancer la recherche dès que l'utilisateur tape
    useEffect(() => {
        if (onSearch) {
            onSearch(query);
        }
    }, [query]);

    return (
        <form onSubmit={(e) => e.preventDefault()} className="search-bar">
            <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />
        </form>
    );
}
