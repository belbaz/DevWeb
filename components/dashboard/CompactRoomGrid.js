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
  Chip,
  Badge,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import StairsIcon from '@mui/icons-material/Stairs';
import MuseumIcon from '@mui/icons-material/Museum';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import SensorsIcon from '@mui/icons-material/Sensors';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistanceToNow } from 'date-fns';

// Styled components
const RoomBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    fontSize: '0.65rem',
    minWidth: '14px',
    height: '14px',
    padding: '0 4px'
  }
}));

const MiniRoomCard = styled(motion.div)(({ theme, selected, status = 'normal', roomtype }) => {
  // Status color mapping
  const getStatusColor = () => {
    switch (status) {
      case 'alert': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'good': return theme.palette.success.main;
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  // Room type color mapping
  const getRoomTypeColor = () => {
    const type = roomtype?.toLowerCase() || '';
    if (type.includes('expo')) return '#9c27b0'; // Purple for exhibition
    if (type.includes('réserve') || type.includes('reserve')) return '#ff9800'; // Orange for storage
    if (type.includes('hall') || type.includes('entrée')) return '#2196f3'; // Blue for entrance
    if (type.includes('tech')) return '#607d8b'; // Blue-gray for technical
    if (type.includes('admin') || type.includes('bureau')) return '#795548'; // Brown for admin
    return '#4caf50'; // Green default
  };

  return {
    backgroundColor: selected 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(30, 30, 40, 0.8)',
    border: '1px solid',
    borderColor: selected ? theme.palette.primary.main : 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    height: '100%',
    minHeight: '75px',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      borderColor: selected ? theme.palette.primary.main : 'rgba(255,255,255,0.3)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      width: '4px',
      height: '100%',
      backgroundColor: getRoomTypeColor(),
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '2px',
      width: '100%',
      backgroundColor: getStatusColor(),
    }
  };
});

const SensorIndicator = styled(Box)(({ theme, status = 'normal' }) => {
  const getColor = () => {
    switch (status) {
      case 'alert': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'good': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  return {
    display: 'inline-flex',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: getColor(),
    marginRight: '4px',
    boxShadow: `0 0 5px ${getColor()}`
  };
});

const CompactRoomGrid = ({ rooms, objects, sensorData, onRoomSelect, selectedRoom }) => {
  const [roomObjectCounts, setRoomObjectCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(null);
  const [roomsByFloor, setRoomsByFloor] = useState({});
  const [roomTypeFilter, setRoomTypeFilter] = useState(null);
  const [uniqueRoomTypes, setUniqueRoomTypes] = useState([]);

  // Calculate objects per room and organize rooms by floor
  useEffect(() => {
    if (Array.isArray(objects) && Array.isArray(rooms)) {
      // Count objects per room
      const counts = {};
      rooms.forEach(room => {
        if (room && room.id) {
          counts[room.id] = 0;
        }
      });
      
      objects.forEach(obj => {
        if (obj && obj.room_id) {
          counts[obj.room_id] = (counts[obj.room_id] || 0) + 1;
        }
      });
      
      // Group rooms by floor
      const floorMap = {};
      const uniqueFloors = new Set();
      const roomTypes = new Set();
      
      rooms.forEach(room => {
        const floor = room.floor !== undefined ? room.floor : 0;
        uniqueFloors.add(floor);
        
        if (room.roomtype) {
          roomTypes.add(room.roomtype);
        }
        
        if (!floorMap[floor]) {
          floorMap[floor] = [];
        }
        floorMap[floor].push(room);
      });
      
      // Sort floors numerically
      const sortedFloors = Array.from(uniqueFloors).sort((a, b) => a - b);
      
      setUniqueRoomTypes(Array.from(roomTypes));
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
    if (floor === 0) return "RDC";
    if (floor === -1) return "Sous-sol";
    return `Étage ${floor}`;
  };
  
  // Function to get room sensor status
  const getRoomStatus = (roomId) => {
    if (!sensorData) return 'normal';
    
    // Find all sensors for this room
    const roomSensors = sensorData.filter(s => s.room_id === roomId);
    if (roomSensors.length === 0) return 'normal';
    
    // Check if any sensor is in alert state
    if (roomSensors.some(s => s.status === 'alert')) return 'alert';
    if (roomSensors.some(s => s.status === 'warning')) return 'warning';
    if (roomSensors.every(s => s.status === 'good')) return 'good';
    
    return 'normal';
  };
  
  // Get last update time for a room
  const getLastUpdateTime = (roomId) => {
    if (!sensorData) return null;
    
    const roomSensors = sensorData.filter(s => s.room_id === roomId);
    if (roomSensors.length === 0) return null;
    
    // Get the most recent update
    const mostRecent = roomSensors.reduce((latest, sensor) => {
      return !latest || new Date(sensor.last_update) > new Date(latest.last_update) 
        ? sensor 
        : latest;
    }, null);
    
    return mostRecent ? mostRecent.last_update : null;
  };
  
  const toggleRoomTypeFilter = (type) => {
    if (roomTypeFilter === type) {
      setRoomTypeFilter(null);
    } else {
      setRoomTypeFilter(type);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <MuseumIcon sx={{ mr: 1 }} /> Plan des Salles
        </Typography>
        
        <Box>
          {roomTypeFilter && (
            <Chip 
              size="small"
              label={roomTypeFilter} 
              onDelete={() => setRoomTypeFilter(null)}
              color="primary"
              sx={{ mr: 1 }}
            />
          )}
        </Box>
      </Box>
      
      {/* Floor tabs */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Tabs 
          value={currentFloor} 
          onChange={handleFloorChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          indicatorColor="primary"
          sx={{ minHeight: '36px' }}
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
                minHeight: '36px',
                py: 0.5,
                fontSize: '0.8rem',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 'bold'
                }
              }}
            />
          ))}
        </Tabs>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {uniqueRoomTypes.map(type => (
            <Tooltip key={type} title={`Filtrer: ${type}`}>
              <Chip 
                size="small"
                label={type.slice(0, 4)}
                onClick={() => toggleRoomTypeFilter(type)}
                color={roomTypeFilter === type ? "primary" : "default"}
                sx={{ 
                  height: '22px',
                  fontSize: '0.65rem',
                  bgcolor: roomTypeFilter === type ? undefined : 'rgba(255,255,255,0.1)'
                }}
              />
            </Tooltip>
          ))}
          
          {roomTypeFilter && (
            <Tooltip title="Effacer le filtre">
              <IconButton 
                size="small" 
                onClick={() => setRoomTypeFilter(null)}
                sx={{ color: 'white', p: 0.5 }}
              >
                <FilterListOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* Room grid */}
      <Paper 
        sx={{ 
          p: 1.5, 
          bgcolor: 'rgba(20, 20, 30, 0.7)',
          backgroundImage: 'url("/images/floor-pattern.svg")',
          backgroundRepeat: 'repeat',
          backgroundSize: '20px',
          backgroundBlendMode: 'overlay',
          borderRadius: 2
        }}
      >
        <Grid container spacing={1}>
          <AnimatePresence>
            {currentFloor !== null && roomsByFloor[currentFloor]
              ?.filter(room => !roomTypeFilter || room.roomtype === roomTypeFilter)
              .map((room, index) => {
                const roomStatus = getRoomStatus(room.id);
                const lastUpdate = getLastUpdateTime(room.id);
              
                return (
                  <Grid item xs={4} sm={3} md={2} lg={1.5} key={room.id}>
                    <MiniRoomCard
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.02 }
                      }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => onRoomSelect(room.id === selectedRoom ? null : room.id)}
                      selected={selectedRoom === room.id}
                      status={roomStatus}
                      roomtype={room.roomtype}
                      layout
                    >
                      <Box sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <RoomBadge badgeContent={roomObjectCounts[room.id] || 0}>
                            <MeetingRoomIcon 
                              sx={{ 
                                fontSize: '1rem', 
                                color: selectedRoom === room.id ? 'primary.main' : 'white',
                                opacity: 0.8
                              }} 
                            />
                          </RoomBadge>
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontSize: '0.65rem',
                              opacity: 0.6, 
                              textTransform: 'uppercase'
                            }}
                          >
                            {room.roomtype?.slice(0, 4) || "Salle"}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Tooltip title={room.name}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%'
                              }}
                            >
                              {room.name || `Salle #${room.id}`}
                            </Typography>
                          </Tooltip>
                          
                          <Box sx={{ 
                            mt: 0.5, 
                            display: 'flex', 
                            alignItems: 'center'
                          }}>
                            <SensorIndicator status={roomStatus} />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '0.6rem',
                                color: roomStatus === 'alert' 
                                  ? 'error.main' 
                                  : roomStatus === 'warning' 
                                    ? 'warning.main' 
                                    : 'text.secondary'
                              }}
                            >
                              {roomStatus === 'alert' 
                                ? 'Alerte' 
                                : roomStatus === 'warning' 
                                  ? 'Attention' 
                                  : 'Normal'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </MiniRoomCard>
                  </Grid>
                );
              })
            }
          </AnimatePresence>
          
          {(!roomsByFloor[currentFloor] || 
            roomsByFloor[currentFloor].filter(r => !roomTypeFilter || r.roomtype === roomTypeFilter).length === 0) && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, textAlign: 'center', opacity: 0.7 }}>
                <Typography variant="body2">
                  {roomTypeFilter 
                    ? `Aucune salle de type "${roomTypeFilter}" dans cet étage` 
                    : "Aucune salle dans cet étage"}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompactRoomGrid; 