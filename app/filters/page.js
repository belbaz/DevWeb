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
                console.error("Erreur lors du fetch :", err);
                setFilteredRooms([]);
            }
        };

        fetchRooms();
    }, [selectedFloors, selectedRoomTypes]);

    return (
        <Box component="main" sx={{ px: 3, py: 4, maxWidth: 800, mx: "auto" }}>
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

            <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                    Filter by Floor
                </Typography>
            </Box>

            <FormGroup row sx={{ justifyContent: "center", mb: 2 }}>
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
                        label={floor === 0 ? "Ground floor (0)" : `Floor ${floor}`}
                    />
                ))}
            </FormGroup>


            <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                    Filter by Room Type
                </Typography>
            </Box>

            <FormGroup row sx={{ justifyContent: "center", mb: 4 }}>
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
                    />
                ))}
            </FormGroup>


            <Button
                variant="text"
                onClick={resetFilters}
                sx={{ textTransform: "none", display: "block", mx: "auto", mb: 4 }}
            >
                Reset all filters
            </Button>

            <Box>
                <Typography variant="h6" gutterBottom>
                    Results
                </Typography>
                {filteredRooms.length === 0 ? (
                    <Typography sx={{ mt: 2, fontStyle: 'italic' }}>
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
                                <Typography>{room.name}</Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    href={`/roomPage/${room.id}`}
                                >
                                    See more
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
}
