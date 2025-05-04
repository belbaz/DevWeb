"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  IconButton,
  Zoom,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import StairsIcon from '@mui/icons-material/Stairs';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MuseumIcon from '@mui/icons-material/Museum';
import SensorsIcon from '@mui/icons-material/Sensors';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import MapIcon from '@mui/icons-material/Map';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';

// Styled components for visual elements
const FloorContainer = styled(Paper)(({ theme }) => ({
  backgroundImage: 'url("/images/floor-pattern.svg")',
  backgroundRepeat: 'repeat',
  backgroundSize: '30px',
  backgroundBlendMode: 'overlay',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255,255,255,0.1)',
}));

const RoomCard = styled(motion.div)(({ theme, selected, status = 'normal' }) => {
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'alert': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'good': return theme.palette.success.main;
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  return {
    background: selected 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(30, 30, 40, 0.8)',
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(1.5),
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: selected ? theme.palette.primary.main : 'rgba(255,255,255,0.1)',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
      borderColor: selected ? theme.palette.primary.main : 'rgba(255,255,255,0.3)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 3,
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
    alignItems: 'center',
    justifyContent: 'center',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: getColor(),
    marginRight: theme.spacing(0.5),
    boxShadow: `0 0 10px ${getColor()}`
  };
});

const LastUpdateText = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.grey[400],
  fontSize: '0.65rem',
  marginTop: theme.spacing(0.5),
}));

const RoomCountBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    padding: '0 6px',
    fontSize: '0.75rem',
  }
}));

// Main component
const FloorPlanView = ({ rooms, objects, sensorData, onRoomSelect, selectedRoom, permissions }) => {
  const [roomObjectCounts, setRoomObjectCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(null);
  const [roomsByFloor, setRoomsByFloor] = useState({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editedRoom, setEditedRoom] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef(null);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'plan'
  
  // Function to get room sensor status (mock function to be replaced with real data)
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
  
  // Calculate last update time for a room (mock function)
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
  
  const handleRoomClick = (roomId) => {
    if (selectedRoom === roomId) {
      onRoomSelect(null);
    } else {
      onRoomSelect(roomId);
    }
  };
  
  const handleEditRoom = (event, room) => {
    event.stopPropagation();
    setEditedRoom(room);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteRoom = (event, room) => {
    event.stopPropagation();
    setEditedRoom(room);
    setIsDeleteDialogOpen(true);
  };
  
  const handleAddRoom = () => {
    setEditedRoom({
      name: '',
      floor: currentFloor,
      roomtype: 'Exhibition',
      levelAcces: '1',
    });
    setIsAddDialogOpen(true);
  };
  
  const handleSaveRoom = async () => {
    try {
      const url = isAddDialogOpen 
        ? '/api/rooms/addRoom'
        : `/api/rooms/updateRoom?id=${editedRoom.id}`;
        
      const method = isAddDialogOpen ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedRoom),
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success(`Room ${isAddDialogOpen ? 'added' : 'updated'} successfully`);
        // Ideally we would refresh the room data from the server here
        // For now we'll just close the dialog
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(`Failed to ${isAddDialogOpen ? 'add' : 'update'} room: ${error.message}`);
    } finally {
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/rooms/deleteRoom?id=${editedRoom.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Room deleted successfully');
        // Ideally refresh room data here
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(`Failed to delete room: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleZoomIn = () => {
    if (zoomLevel < 1.5) setZoomLevel(prev => prev + 0.1);
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 0.5) setZoomLevel(prev => prev - 0.1);
  };

  // Function to estimate room positions based on room types and IDs
  const generateRoomLayout = (roomsToLayout) => {
    if (!roomsToLayout || roomsToLayout.length === 0) return {};
    
    const layout = {};
    const gridSize = Math.ceil(Math.sqrt(roomsToLayout.length));
    
    // Step 1: Group rooms by type
    const roomsByType = {};
    roomsToLayout.forEach(room => {
      const type = room.roomtype || 'exhibition';
      if (!roomsByType[type]) {
        roomsByType[type] = [];
      }
      roomsByType[type].push(room);
    });
    
    // Step 2: Place rooms in a logical order
    // Common room types and their placement priority
    const priorityTypes = [
      'entrance', 'hall', 'lobby', 'reception',  // Entry area types
      'exhibition', 'gallery', 'display',        // Main display areas
      'storage', 'archive', 'conservation',      // Back-of-house areas
      'office', 'meeting', 'admin',              // Administrative areas
      'cafe', 'restaurant', 'shop', 'gift'       // Amenities
    ];
    
    let placedCount = 0;
    let x = 0;
    let y = 0;
    const maxX = gridSize - 1;
    const maxY = gridSize - 1;
    
    // Place rooms in a spiral pattern, prioritizing by type
    const spiral = (startX, startY, width, height) => {
      if (width <= 0 || height <= 0) return;
      
      // Top row
      for (let i = 0; i < width; i++) {
        const posX = startX + i;
        const posY = startY;
        const position = `${posX},${posY}`;
        layout[position] = layout[position] || null;
      }
      
      // Right column
      for (let i = 1; i < height; i++) {
        const posX = startX + width - 1;
        const posY = startY + i;
        const position = `${posX},${posY}`;
        layout[position] = layout[position] || null;
      }
      
      // Bottom row (if height > 1)
      if (height > 1) {
        for (let i = width - 2; i >= 0; i--) {
          const posX = startX + i;
          const posY = startY + height - 1;
          const position = `${posX},${posY}`;
          layout[position] = layout[position] || null;
        }
      }
      
      // Left column (if width > 1)
      if (width > 1) {
        for (let i = height - 2; i > 0; i--) {
          const posX = startX;
          const posY = startY + i;
          const position = `${posX},${posY}`;
          layout[position] = layout[position] || null;
        }
      }
      
      // Recursively fill the inside
      spiral(startX + 1, startY + 1, width - 2, height - 2);
    };
    
    spiral(0, 0, gridSize, gridSize);
    
    // Now assign rooms to positions based on priority
    const positions = Object.keys(layout);
    
    // First place rooms by priority type
    priorityTypes.forEach(type => {
      const matchingRooms = roomsToLayout.filter(r => 
        (r.roomtype || '').toLowerCase().includes(type.toLowerCase())
      );
      
      matchingRooms.forEach(room => {
        if (placedCount < positions.length) {
          layout[positions[placedCount]] = room;
          placedCount++;
        }
      });
    });
    
    // Then place any remaining rooms
    roomsToLayout.forEach(room => {
      // Skip if room is already placed
      if (Object.values(layout).some(r => r && r.id === room.id)) return;
      
      if (placedCount < positions.length) {
        layout[positions[placedCount]] = room;
        placedCount++;
      }
    });
    
    return layout;
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
          <MuseumIcon sx={{ mr: 1 }} /> 
          Museum Floor Plan
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {selectedRoom && (
            <Chip 
              icon={<MeetingRoomIcon />}
              label={rooms.find(r => r.id === selectedRoom)?.name || `Room #${selectedRoom}`}
              color="primary"
              variant="outlined"
              onDelete={() => onRoomSelect(null)}
              sx={{ mr: 2 }}
            />
          )}
          
          <Tooltip title={viewType === 'grid' ? 'Switch to floor plan view' : 'Switch to grid view'}>
            <IconButton 
              onClick={() => setViewType(viewType === 'grid' ? 'plan' : 'grid')}
              size="small"
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', mr: 1 }}
            >
              {viewType === 'grid' ? <MapIcon fontSize="small" /> : <ViewQuiltIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Floor tabs */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
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
        
        <Box>
          {permissions.updateRoom && (
            <Tooltip title="Add new room">
              <IconButton color="primary" onClick={handleAddRoom}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* Interactive floor plan */}
      <FloorContainer 
        sx={{ 
          p: 3, 
          position: 'relative',
          backgroundImage: viewType === 'plan' ? 'none' : 'url("/images/floor-pattern.svg")',
        }}
      >
        {/* Zoom controls */}
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 1,
          p: 0.5
        }}>
          <IconButton 
            size="small" 
            onClick={handleZoomIn} 
            sx={{ color: 'white', mb: 0.5 }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleZoomOut} 
            sx={{ color: 'white' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {/* Floor legend */}
        <Box sx={{ 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          pb: 1.5, 
          mb: 2,
          display: 'flex',
          gap: 2
        }}>
          <Chip 
            size="small" 
            variant="outlined" 
            icon={<SensorsIcon sx={{ color: 'error.main' }} />} 
            label="Alert" 
            sx={{ backgroundColor: 'rgba(255,0,0,0.1)' }}
          />
          <Chip 
            size="small" 
            variant="outlined" 
            icon={<SensorsIcon sx={{ color: 'warning.main' }} />} 
            label="Warning" 
            sx={{ backgroundColor: 'rgba(255,180,0,0.1)' }}
          />
          <Chip 
            size="small" 
            variant="outlined" 
            icon={<SensorsIcon sx={{ color: 'success.main' }} />} 
            label="Normal" 
            sx={{ backgroundColor: 'rgba(0,255,0,0.1)' }}
          />
        </Box>
        
        {/* Floor plan layout */}
        {viewType === 'plan' && currentFloor !== null && roomsByFloor[currentFloor]?.length > 0 && (
          <Box 
            ref={containerRef}
            sx={{ 
              position: 'relative',
              width: '100%',
              minHeight: 500,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              transition: 'transform 0.3s ease',
              backgroundImage: `url('/images/floor-blueprint.svg')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              mb: 2
            }}
          >
            <AnimatePresence>
              {(() => {
                const layout = generateRoomLayout(roomsByFloor[currentFloor]);
                const gridSize = Math.ceil(Math.sqrt(Object.keys(layout).length));
                
                return Object.entries(layout).map(([position, room]) => {
                  if (!room) return null;
                  
                  const [x, y] = position.split(',').map(Number);
                  const roomStatus = getRoomStatus(room.id);
                  const lastUpdate = getLastUpdateTime(room.id);
                  
                  // Calculate position percentage for nice layout
                  const posX = (x / gridSize) * 90 + 5; // 5-95% width
                  const posY = (y / gridSize) * 85 + 5; // 5-90% height
                  
                  // Adjust size based on room type
                  let width, height;
                  const roomtype = (room.roomtype || '').toLowerCase();
                  
                  if (roomtype.includes('hall') || roomtype.includes('lobby') || roomtype.includes('entrance')) {
                    width = 20;
                    height = 15;
                  } else if (roomtype.includes('exhibition') || roomtype.includes('gallery')) {
                    width = 15;
                    height = 15;
                  } else if (roomtype.includes('storage') || roomtype.includes('archive')) {
                    width = 12;
                    height = 10;
                  } else if (roomtype.includes('office') || roomtype.includes('admin')) {
                    width = 10;
                    height = 8;
                  } else {
                    width = 12;
                    height = 12;
                  }
                  
                  return (
                    <RoomCard
                      key={room.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleRoomClick(room.id)}
                      selected={selectedRoom === room.id}
                      status={roomStatus}
                      layout
                      sx={{
                        position: 'absolute',
                        left: `${posX}%`,
                        top: `${posY}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        maxHeight: 120,
                        zIndex: selectedRoom === room.id ? 10 : 1
                      }}
                    >
                      <Box sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                        }}>
                          <RoomCountBadge badgeContent={roomObjectCounts[room.id] || 0}>
                            <MeetingRoomIcon color="primary" />
                          </RoomCountBadge>
                          
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {permissions.updateRoom && (
                              <Tooltip title="Edit room">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => handleEditRoom(e, room)}
                                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {permissions.deleteRoom && (
                              <Tooltip title="Delete room">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => handleDeleteRoom(e, room)}
                                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {room.name || `Room #${room.id}`}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mt: 0.5
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
                              {roomStatus}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </RoomCard>
                  );
                });
              })()}
            </AnimatePresence>
            
            {/* Connection lines between rooms */}
            <svg 
              width="100%" 
              height="100%" 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                pointerEvents: 'none',
                zIndex: 0
              }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                  <path d="M0,0 L4,2 L0,4 Z" fill="rgba(255,255,255,0.3)" />
                </marker>
              </defs>
              {(() => {
                const layout = generateRoomLayout(roomsByFloor[currentFloor]);
                const gridSize = Math.ceil(Math.sqrt(Object.keys(layout).length));
                const paths = [];
                
                Object.entries(layout).forEach(([position, room]) => {
                  if (!room) return;
                  
                  const [x, y] = position.split(',').map(Number);
                  
                  // Connect to adjacent rooms
                  const directions = [
                    { dx: 1, dy: 0 }, // right
                    { dx: 0, dy: 1 }, // down
                    { dx: -1, dy: 0 }, // left
                    { dx: 0, dy: -1 }, // up
                  ];
                  
                  directions.forEach(({ dx, dy }) => {
                    const newX = x + dx;
                    const newY = y + dy;
                    const newPos = `${newX},${newY}`;
                    
                    if (layout[newPos]) {
                      const startX = (x / gridSize) * 90 + 5 + (dx < 0 ? 0 : dx > 0 ? 15 : 7.5);
                      const startY = (y / gridSize) * 85 + 5 + (dy < 0 ? 0 : dy > 0 ? 15 : 7.5);
                      const endX = (newX / gridSize) * 90 + 5 + (dx > 0 ? 0 : dx < 0 ? 15 : 7.5);
                      const endY = (newY / gridSize) * 85 + 5 + (dy > 0 ? 0 : dy < 0 ? 15 : 7.5);
                      
                      // Only draw half the paths (to avoid duplicates)
                      if (dx > 0 || (dx === 0 && dy > 0)) {
                        paths.push(
                          <path 
                            key={`${position}-${newPos}`}
                            d={`M${startX}% ${startY}% L${endX}% ${endY}%`}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="1"
                            strokeDasharray="3,2"
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      }
                    }
                  });
                });
                
                return paths;
              })()}
            </svg>
          </Box>
        )}
        
        {/* Grid layout (original) */}
        {viewType === 'grid' && (
          <Box 
            ref={containerRef}
            sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 2,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              transition: 'transform 0.3s ease',
              minHeight: 400
            }}
          >
            <AnimatePresence>
              {currentFloor !== null && roomsByFloor[currentFloor]?.map(room => {
                const roomStatus = getRoomStatus(room.id);
                const lastUpdate = getLastUpdateTime(room.id);
                
                return (
                  <RoomCard
                    key={room.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleRoomClick(room.id)}
                    selected={selectedRoom === room.id}
                    status={roomStatus}
                    layout
                  >
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1
                    }}>
                      <RoomCountBadge badgeContent={roomObjectCounts[room.id] || 0}>
                        <MeetingRoomIcon color="primary" />
                      </RoomCountBadge>
                      
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {permissions.updateRoom && (
                          <Tooltip title="Edit room">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleEditRoom(e, room)}
                              sx={{ color: 'rgba(255,255,255,0.7)' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {permissions.deleteRoom && (
                          <Tooltip title="Delete room">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleDeleteRoom(e, room)}
                              sx={{ color: 'rgba(255,255,255,0.7)' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {room.name || `Room #${room.id}`}
                      </Typography>
                      
                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                        {room.roomtype || "Exhibition"}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mt: 1.5
                      }}>
                        <SensorIndicator status={roomStatus} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: roomStatus === 'alert' 
                              ? 'error.main' 
                              : roomStatus === 'warning' 
                                ? 'warning.main' 
                                : 'text.secondary'
                          }}
                        >
                          {roomStatus === 'alert' 
                            ? 'Alert' 
                            : roomStatus === 'warning' 
                              ? 'Warning' 
                              : 'Normal'}
                        </Typography>
                      </Box>
                      
                      {lastUpdate && (
                        <LastUpdateText variant="caption">
                          <AccessTimeIcon sx={{ fontSize: '0.8rem', mr: 0.5, opacity: 0.7 }} />
                          Last update: {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}
                        </LastUpdateText>
                      )}
                    </Box>
                  </RoomCard>
                );
              })}
            </AnimatePresence>
            
            {(!roomsByFloor[currentFloor] || roomsByFloor[currentFloor].length === 0) && (
              <Box sx={{ 
                p: 3, 
                textAlign: 'center',
                opacity: 0.7,
                gridColumn: '1 / -1'
              }}>
                <Typography>No rooms on this floor</Typography>
                {permissions.updateRoom && (
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    onClick={handleAddRoom}
                    sx={{ mt: 2 }}
                  >
                    Add Room
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}
      </FloorContainer>
      
      {/* Edit/Add Room Dialog */}
      <Dialog 
        open={isEditDialogOpen || isAddDialogOpen} 
        onClose={() => {
          setIsEditDialogOpen(false);
          setIsAddDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isAddDialogOpen ? "Add New Room" : "Edit Room"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Room Name"
              fullWidth
              value={editedRoom?.name || ''}
              onChange={(e) => setEditedRoom({...editedRoom, name: e.target.value})}
            />
            
            <TextField
              label="Floor Number"
              type="number"
              fullWidth
              value={editedRoom?.floor || 0}
              onChange={(e) => setEditedRoom({...editedRoom, floor: parseInt(e.target.value, 10)})}
            />
            
            <FormControl fullWidth>
              <InputLabel>Room Type</InputLabel>
              <Select
                value={editedRoom?.roomtype || 'Exhibition'}
                label="Room Type"
                onChange={(e) => setEditedRoom({...editedRoom, roomtype: e.target.value})}
              >
                <MenuItem value="Exhibition">Exhibition</MenuItem>
                <MenuItem value="Storage">Storage</MenuItem>
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Gallery">Gallery</MenuItem>
                <MenuItem value="Lobby">Lobby</MenuItem>
                <MenuItem value="Conservation">Conservation</MenuItem>
                <MenuItem value="Archive">Archive</MenuItem>
                <MenuItem value="Workshop">Workshop</MenuItem>
                <MenuItem value="Shop">Gift Shop</MenuItem>
                <MenuItem value="Cafe">Cafe</MenuItem>
                <MenuItem value="Restroom">Restroom</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Access Level</InputLabel>
              <Select
                value={editedRoom?.levelAcces || '1'}
                label="Access Level"
                onChange={(e) => setEditedRoom({...editedRoom, levelAcces: e.target.value})}
              >
                <MenuItem value="1">Level 1</MenuItem>
                <MenuItem value="2">Level 2</MenuItem>
                <MenuItem value="3">Level 3</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsEditDialogOpen(false);
              setIsAddDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveRoom} 
            variant="contained" 
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete room "{editedRoom?.name || `#${editedRoom?.id}`}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FloorPlanView; 