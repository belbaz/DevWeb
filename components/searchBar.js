"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../styles/searchBar.css";

export default function SearchBar({ onSearch, showFiltersButton = true }) {
    const [query, setQuery] = useState("");
    const router = useRouter();

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
            {showFiltersButton && (
                <button
                    type="button"
                    className="filter-button"
                    onClick={() => router.push("/filters")}
                >
                    + de filtres
                </button>
            )}
        </form>
    );
}
