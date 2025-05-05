"use client";

import { useEffect, useState, useMemo } from "react";
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
    const [expoList, setExpoList] = useState([]);
    const router = useRouter();


    const availableFloors = [0, 1, 2, 3];
    const baseRoomTypes = [
        { value: "hall", label: "Hall" },
        { value: "storage", label: "Storage" },
    ];
    const toggleFloor = (floor) => {
        setSelectedFloors((prev) =>
            prev.includes(floor) ? prev.filter((f) => f !== floor) : [...prev, floor]
        );
    };

    const expoMap = useMemo(() => {
        if (!Array.isArray(expoList)) return {};
        return Object.fromEntries(expoList.map(expo => [expo.id, expo.name]));
    }, [expoList]);


    useEffect(() => {
        fetch("/api/expo/list")
            .then(res => res.json())
            .then(data => setExpoList(data.expos || []))
            .catch(err => console.error("Expo list error:", err));
    }, []);

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
            if (selectedRoomTypes.length > 0) {
                // Encode "hall", "réserve", and each "exposition:{expo_id}"
                params.append("types", selectedRoomTypes.join(","));
            }

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
                pt: '80px',
                pb: '20px',
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

                <Box sx={{ borderBottom: '1px solid #444', my: 3, mx: 'auto', width: '60%' }} />

                <Box textAlign="center" sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-roboto)', fontWeight: 'bold', color: 'white', mb: 1 }}>
                        Room Type
                    </Typography>

                    <Box sx={{ height: 12 }} />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2,
                            justifyContent: 'center',
                        }}
                    >
                        {[...baseRoomTypes, ...expoList.map(expo => ({
                            value: `exposition:${expo.id}`,
                            label: expo.name
                        }))].map((typeObj) => (
                            <FormControlLabel
                                key={typeObj.value}
                                control={
                                    <Checkbox
                                        checked={selectedRoomTypes.includes(typeObj.value)}
                                        onChange={() => toggleRoomType(typeObj.value)}
                                        sx={{
                                            color: 'white',
                                            '&.Mui-checked': {
                                                color: 'white',
                                            },
                                        }}
                                    />
                                }
                                label={typeObj.label}
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
                                    <Box>
                                        <Typography sx={{ fontFamily: 'var(--font-roboto)', color: 'white' }}>
                                            {room.name}
                                        </Typography>
                                        {room.roomtype === "exposition" && room.expo_id && (
                                            <Typography sx={{ fontFamily: 'var(--font-roboto)', fontSize: '0.8rem', color: '#aaaaaa', fontStyle: 'italic' }}>
                                                Exposition : {expoMap[room.expo_id] || `Exposition ${room.expo_id}`}
                                            </Typography>
                                        )}
                                    </Box>
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
