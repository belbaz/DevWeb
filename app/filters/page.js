"use client";

import { useEffect, useState } from "react";
import SearchBar from "components/searchBar";
import "styles/filters.css";

export default function FiltersPage() {
    const [query, setQuery] = useState("");
    const [selectedFloors, setSelectedFloors] = useState([]);
    const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);

    const availableFloors = [0, 1];
    const availableRoomTypes = [
        "hall",
        "réserve",
        "exposition permanente",
        "exposition temporaire"
    ];

    const toggleFloor = (floor) => {
        setSelectedFloors((prev) =>
            prev.includes(floor)
                ? prev.filter((f) => f !== floor)
                : [...prev, floor]
        );
    };

    const toggleRoomType = (type) => {
        setSelectedRoomTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    useEffect(() => {
        const fetchRooms = async () => {
            const params = new URLSearchParams();

            if (query) params.append("q", query);
            if (selectedFloors.length > 0) params.append("floors", selectedFloors.join(","));
            if (selectedRoomTypes.length > 0) params.append("types", selectedRoomTypes.join(","));

            try {
                const res = await fetch(`/api/search?${params.toString()}`);
                const data = await res.json();
                const roomsOnly = data.filter(item => item.type === "Pièce");
                setFilteredRooms(roomsOnly);
            } catch (err) {
                console.error("Erreur lors du fetch :", err);
                setFilteredRooms([]);
            }
        };

        fetchRooms();
    }, [query, selectedFloors, selectedRoomTypes]);

    return (
        <main className="filters-page">
            <h1 className="filters-title">Advanced Search</h1>

            <div className="filters-searchbar large-searchbar">
                <SearchBar onSearch={setQuery} showFiltersButton={false} />
            </div>

            <div className="filters-section">
                <h2 className="filters-subtitle">Filter by Floor</h2>
                <div className="checkbox-group">
                    {availableFloors.map((floor) => (
                        <label key={floor} className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={selectedFloors.includes(floor)}
                                onChange={() => toggleFloor(floor)}
                            />
                            <span>{floor === 0 ? "Ground floor (0)" : `Floor ${floor}`}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="filters-section">
                <h2 className="filters-subtitle">Filter by Room Type</h2>
                <div className="checkbox-group">
                    {availableRoomTypes.map((type) => (
                        <label key={type} className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={selectedRoomTypes.includes(type)}
                                onChange={() => toggleRoomType(type)}
                            />
                            <span>{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="results-list">
                <h2 className="filters-subtitle">Results</h2>
                {filteredRooms.length === 0 ? (
                    <p>No matching room found.</p>
                ) : (
                    <ul>
                        {filteredRooms.map((room, index) => (
                            <li key={index} className="room-item">
                                <span>{room.name}</span>
                                <a href={`/roomPage/${room.id}`} className="see-more-button">
                                    See more
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </main>
    );
}
