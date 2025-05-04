"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Tabs, 
  Tab,
  Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import StairsIcon from '@mui/icons-material/Stairs';

const RoomMap = ({ rooms, objects, onRoomSelect, selectedRoom }) => {
  const [roomObjectCounts, setRoomObjectCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(null);
  const [roomsByFloor, setRoomsByFloor] = useState({});

  useEffect(() => {
    if (Array.isArray(objects) && Array.isArray(rooms)) {
      // Calculate objects per room
      const counts = {};
      
      // Initialize all rooms with 0 count
      rooms.forEach(room => {
        if (room && room.id) {
          counts[room.id] = 0;
        }
      });
      
      // Count objects per room
      objects.forEach(obj => {
        if (obj && obj.room_id) {
          counts[obj.room_id] = (counts[obj.room_id] || 0) + 1;
        }
      });
      
      // Group rooms by floor
      const floorMap = {};
      const uniqueFloors = new Set();
      
      rooms.forEach(room => {
        const floor = room.floor !== undefined ? room.floor : 0;
        uniqueFloors.add(floor);
        
        if (!floorMap[floor]) {
          floorMap[floor] = [];
        }
        floorMap[floor].push(room);
      });
      
      // Sort floors numerically
      const sortedFloors = Array.from(uniqueFloors).sort((a, b) => a - b);
      
      setRoomsByFloor(floorMap);
      setFloors(sortedFloors);
      setCurrentFloor(sortedFloors.length > 0 ? sortedFloors[0] : null);
      setRoomObjectCounts(counts);
      setLoading(false);
    }
  }, [rooms, objects]);

  const handleFloorChange = (event, newValue) => {
    setCurrentFloor(newValue);
  };

  const getFloorName = (floor) => {
    if (floor === 0) return "Ground Floor";
    if (floor === -1) return "Basement";
    return `Floor ${floor}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon sx={{ mr: 1 }} /> Museum Map
        </Typography>
        
        {selectedRoom && (
          <Chip 
            icon={<ArtTrackIcon />}
            label={rooms.find(r => r.id === selectedRoom)?.name || `Room #${selectedRoom}`}
            color="primary"
            variant="outlined"
            onDelete={() => onRoomSelect(null)}
          />
        )}
      </Box>
      
      {/* Floor tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={currentFloor} 
          onChange={handleFloorChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          indicatorColor="primary"
        >
          {floors.map(floor => (
            <Tab 
              key={floor} 
              value={floor} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StairsIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  {getFloorName(floor)}
                </Box>
              }
              sx={{ 
                color: 'white',
                borderRadius: '4px 4px 0 0',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 'bold'
                }
              }}
            />
          ))}
        </Tabs>
      </Box>
      
      {/* Room grid for current floor */}
      <Paper 
        sx={{ 
          p: 2, 
          bgcolor: 'rgba(20, 20, 30, 0.7)', 
          backgroundImage: `url('/images/floor-pattern.svg')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '30px',
          backgroundBlendMode: 'overlay',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <Grid container spacing={1.5}>
          {currentFloor !== null && roomsByFloor[currentFloor]?.map(room => (
            <Grid item xs={4} sm={3} md={2} key={room.id}>
              <Paper 
                sx={{ 
                  bgcolor: selectedRoom === room.id 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(30, 30, 40, 0.8)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: selectedRoom === room.id 
                    ? 'primary.main' 
                    : 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                    borderColor: 'primary.light',
                  },
                  position: 'relative'
                }}
                onClick={() => onRoomSelect(room.id === selectedRoom ? null : room.id)}
                elevation={selectedRoom === room.id ? 8 : 1}
              >
                <Box sx={{ 
                  p: 1.5,
                  pl: 2,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis' 
                      }}
                    >
                      {room.name || `Room #${room.id}`}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7,
                        display: 'block'
                      }}
                    >
                      {room.roomtype || "Exhibition"}
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      ml: 1,
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: selectedRoom === room.id 
                        ? 'primary.main' 
                        : 'rgba(255, 255, 255, 0.1)',
                      color: selectedRoom === room.id 
                        ? 'primary.contrastText' 
                        : 'white',
                      border: '1px solid',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {roomObjectCounts[room.id] || 0}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Decorative accent based on object count */}
                {roomObjectCounts[room.id] > 0 && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: 2,
                      width: '100%',
                      bgcolor: `hsl(${(room.id * 50) % 360}, 70%, 50%)`,
                      transition: 'all 0.3s ease'
                    }} 
                  />
                )}
              </Paper>
            </Grid>
          ))}
          
          {/* Show message if floor has no rooms */}
          {(!roomsByFloor[currentFloor] || roomsByFloor[currentFloor].length === 0) && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 3, 
                textAlign: 'center',
                opacity: 0.7 
              }}>
                <Typography>No rooms on this floor</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default RoomMap; 