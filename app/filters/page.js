"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    FormGroup,
    List,
    ListItem,
    Button
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function FiltersPage() {
    const [selectedFloors, setSelectedFloors] = useState([]);
    const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const router = useRouter();

    const availableFloors = [0, 1];
    const availableRoomTypes = [
        "hall",
        "réserve",
        "exposition permanente",
        "exposition temporaire"
    ];

    const toggleFloor = (floor) => {
        setSelectedFloors((prev) =>
            prev.includes(floor) ? prev.filter((f) => f !== floor) : [...prev, floor]
        );
    };

    const toggleRoomType = (type) => {
        setSelectedRoomTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const resetFilters = () => {
        setSelectedFloors([]);
        setSelectedRoomTypes([]);
        setFilteredRooms([]);
    };

    useEffect(() => {
        const fetchRooms = async () => {
            const params = new URLSearchParams();
            if (selectedFloors.length > 0) params.append("floors", selectedFloors.join(","));
            if (selectedRoomTypes.length > 0) params.append("types", selectedRoomTypes.join(","));

            try {
                const res = await fetch(`/api/search?${params.toString()}`);
                const data = await res.json();
                const roomsOnly = data.filter(item => item.type === "Pièce");
                setFilteredRooms(roomsOnly);
            } catch (err) {
                console.error("Fetch error:", err);
                setFilteredRooms([]);
            }
        };

        fetchRooms();
    }, [selectedFloors, selectedRoomTypes]);

    return (
        <Box
            sx={{
                background: 'none',
                minHeight: '100vh',
                margin: 0,
                // Add padding to account for header height
                pt: '80px', // Adjust this value based on your header height
                // Add padding at the bottom for the footer if needed
                pb: '20px',
                // Make sure content doesn't overflow
                overflow: 'auto'
            }}
        >
            <Typography variant="h3" sx={{
                fontFamily: 'var(--font-cinzel)',
                color: 'rgba(255, 255, 255, 0.95)',
                letterSpacing: 3,
                textAlign: 'center',
                mb: 3,
                '&:hover': { color: 'white' }
            }}>
                Advanced Search
            </Typography>

            <Box component="main" sx={{
                px: 3,
                py: 4,
                maxWidth: 800,
                mx: "auto",
                // Add space between content and navigation elements
                position: 'relative',
                zIndex: 1
            }}>
                <Box textAlign="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-roboto)', fontWeight: 'bold', color: 'white', mb: 1 }}>
                        Floor
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                        {availableFloors.map((floor) => (
                            <FormControlLabel
                                key={floor}
                                control={
                                    <Checkbox
                                        checked={selectedFloors.includes(floor)}
                                        onChange={() => toggleFloor(floor)}
                                        sx={{
                                            color: 'white',
                                            '&.Mui-checked': {
                                                color: 'white',
                                            },
                                        }}
                                    />
                                }
                                label={floor === 0 ? "Ground floor" : `Floor ${floor}`}
                                sx={{ color: 'white', fontFamily: 'var(--font-roboto)' }}
                            />
                        ))}
                    </Box>
                </Box>

                <Box textAlign="center" sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-roboto)', fontWeight: 'bold', color: 'white', mb: 1 }}>
                        Room Type
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                        {availableRoomTypes.map((type) => (
                            <FormControlLabel
                                key={type}
                                control={
                                    <Checkbox
                                        checked={selectedRoomTypes.includes(type)}
                                        onChange={() => toggleRoomType(type)}
                                        sx={{
                                            color: 'white',
                                            '&.Mui-checked': {
                                                color: 'white',
                                            },
                                        }}
                                    />
                                }
                                label={type}
                                sx={{ color: 'white', fontFamily: 'var(--font-roboto)' }}
                            />
                        ))}
                    </Box>
                </Box>

                <Button
                    variant="text"
                    onClick={resetFilters}
                    sx={{
                        textTransform: "none",
                        display: "block",
                        mx: "auto",
                        mb: 4,
                        fontFamily: 'var(--font-roboto)'
                    }}
                >
                    Reset all filters
                </Button>
            </Box>

            <Box component="main" sx={{ px: 3, py: 2, maxWidth: 800, mx: "auto" }}>
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'var(--font-roboto)', color: 'white' }}>
                        Results
                    </Typography>
                    {filteredRooms.length === 0 ? (
                        <Typography sx={{ mt: 2, fontStyle: 'italic', fontFamily: 'var(--font-roboto)', color: 'white' }}>
                            No matching room found.
                        </Typography>
                    ) : (
                        <List>
                            {filteredRooms.map((room, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        py: 1
                                    }}
                                >
                                    <Typography sx={{ fontFamily: 'var(--font-roboto)', color: 'white' }}>
                                        {room.name}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        href={`/room/${room.id}`}
                                        sx={{ fontFamily: 'var(--font-roboto)' }}
                                    >
                                        See more
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
        </Box>
    );
}