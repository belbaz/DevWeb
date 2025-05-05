"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tooltip, 
  Grid,
  Chip,
  Badge,
  CircularProgress,
  Button,
  useMediaQuery,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StairsIcon from '@mui/icons-material/Stairs';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DevicesIcon from '@mui/icons-material/Devices';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import LaunchIcon from '@mui/icons-material/Launch';
import { useRouter } from 'next/navigation';

// Styled components
const FloorButton = styled(Paper)(({ theme, isactive }) => ({
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: isactive === 'true' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(30, 30, 40, 0.8)',
  color: 'white',
  borderRadius: 0,
  minWidth: '100px',
  maxWidth: '130px',
  position: 'relative',
  transition: 'all 0.2s ease',
  border: '1px solid',
  borderColor: isactive === 'true' ? 'rgba(33, 150, 243, 0.6)' : 'rgba(255, 255, 255, 0.1)',
  margin: '4px',
  flex: '1 0 auto',
  '&:hover': {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderColor: 'rgba(33, 150, 243, 0.4)',
  }
}));

// Styled Toggle Button for show/hide rooms
const ToggleRoomsButton = styled(Paper)(({ theme, buttonwidth }) => ({
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: 'rgba(33, 150, 243, 0.1)',
  color: 'white',
  borderRadius: 0,
  position: 'relative',
  transition: 'all 0.2s ease',
  border: '1px solid rgba(33, 150, 243, 0.3)',
  margin: '4px',
  flex: '1 0 auto',
  width: buttonwidth === 'full' ? 'calc(100% - 8px)' : 
         buttonwidth === 'double' ? 'calc(66.66% - 8px)' : 
         buttonwidth === 'single' ? 'calc(33.33% - 8px)' : 'auto',
  '&:hover': {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderColor: 'rgba(33, 150, 243, 0.5)',
  }
}));

// Custom styled badge that appears as a circular notification
const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: -3,
    padding: '0 4px',
    backgroundColor: '#2196f3',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.65rem',
    minWidth: '18px',
    height: '18px',
    borderRadius: '50%'
  }
}));

const RoomCard = styled(Paper)(({ theme, isactive }) => ({
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  backgroundColor: isactive === 'true' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(30, 30, 40, 0.8)',
  color: 'white',
  borderRadius: 0,
  height: '100%',
  position: 'relative',
  transition: 'all 0.2s ease',
  border: '1px solid',
  borderColor: isactive === 'true' ? 'rgba(33, 150, 243, 0.6)' : 'rgba(255, 255, 255, 0.1)',
  '&:hover': {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderColor: 'rgba(33, 150, 243, 0.4)',
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  }
}));

// Bouton d'ajout de room avec animation
const AddRoomCard = styled(Paper)(({ theme }) => ({
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: 'rgba(13, 110, 253, 0.2)',
  color: 'white',
  borderRadius: 0,
  height: '100%',
  position: 'relative',
  transition: 'all 0.2s ease',
  border: '1px dashed rgba(255, 255, 255, 0.3)',
  overflow: 'hidden',
  // Effets de survol uniquement sur desktop
  '@media (min-width: 600px)': {
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      backgroundColor: 'rgba(13, 110, 253, 0.3)',
      '& .add-room-text': {
        opacity: 1,
        transform: 'translateY(0)'
      },
      '& .add-icon-wrapper': {
        transform: 'translateY(-10px)'
      }
    }
  },
  // Effet active pour mobile (au clic)
  '@media (max-width: 599px)': {
    '&:active': {
      backgroundColor: 'rgba(13, 110, 253, 0.4)',
      borderColor: 'rgba(255, 255, 255, 0.6)',
    }
  }
}));

const FloorOverview = ({ rooms, objects, objectData, onRoomSelect, selectedRoom, onFloorSelect }) => {
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [roomsByFloor, setRoomsByFloor] = useState({});
  const [objectCountByRoom, setObjectCountByRoom] = useState({});
  const [objectTypesByRoom, setObjectTypesByRoom] = useState({});
  const [objectTypesByFloor, setObjectTypesByFloor] = useState({});
  const [objectCountByFloor, setObjectCountByFloor] = useState({});
  const [error, setError] = useState(null);
  const [showRooms, setShowRooms] = useState(false);
  const router = useRouter();
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedContextRoom, setSelectedContextRoom] = useState(null);
  const longPressTimerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Using fixed breakpoint values directly instead of theme-dependent queries
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  // Process room and object data
  useEffect(() => {
    const processData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!Array.isArray(rooms) || !Array.isArray(objects)) {
          throw new Error("Invalid data format: Expected arrays for rooms and objects");
        }
        
        // Extract unique floors from actual room data
        const uniqueFloors = [...new Set(rooms.map(room => 
          room.floor !== undefined && room.floor !== null ? String(room.floor) : 'Unknown'
        ))].sort((a, b) => {
          // Sort floors numerically if possible
          const floorA = !isNaN(Number(a)) ? Number(a) : a;
          const floorB = !isNaN(Number(b)) ? Number(b) : b;
          return floorA - floorB;
        });
        
        setFloors(uniqueFloors);
        
        // Group rooms by floor
        const roomsGrouped = {};
        uniqueFloors.forEach(floor => {
          roomsGrouped[floor] = rooms.filter(room => 
            String(room.floor) === floor
          );
        });
        
        setRoomsByFloor(roomsGrouped);
        
        // Count objects per room
        const roomCounts = {};
        objects.forEach(obj => {
          if (obj.room_id) {
            roomCounts[obj.room_id] = (roomCounts[obj.room_id] || 0) + 1;
          }
        });
        
        setObjectCountByRoom(roomCounts);
        
        // Count unique object types per room
        const typesByRoom = {};
        rooms.forEach(room => {
          // Get object instances in this room
          const roomInstances = objectData.filter(instance => instance.room_id === room.id);
          // Get unique types from objectData (using type_Object field)
          const uniqueTypes = new Set(roomInstances.map(instance => instance.type_Object).filter(Boolean));
          typesByRoom[room.id] = uniqueTypes.size;
        });
        
        setObjectTypesByRoom(typesByRoom);
        
        // Calculate object types and counts by floor
        const typesByFloor = {};
        const countsByFloor = {};
        
        uniqueFloors.forEach(floor => {
          const floorRooms = roomsGrouped[floor] || [];
          const floorRoomIds = floorRooms.map(room => room.id);
          
          // Count object instances on this floor
          const instancesOnFloor = objectData.filter(instance => floorRoomIds.includes(instance.room_id));
          countsByFloor[floor] = instancesOnFloor.length;
          
          // Count unique object types on this floor using objectData
          const types = new Set(instancesOnFloor.map(instance => instance.type_Object).filter(Boolean));
          typesByFloor[floor] = types.size;
        });
        
        setObjectTypesByFloor(typesByFloor);
        setObjectCountByFloor(countsByFloor);
        
      } catch (err) {
        console.error("Error processing floor data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    processData();
  }, [rooms, objects, objectData]);
  
  // Réinitialiser showRooms à false lors d'un changement d'étage sur mobile
  useEffect(() => {
    // Nous supprimons cette logique pour conserver l'état d'affichage des salles
    // Code précédent supprimé
  }, [selectedFloor, isMobile]);
  
  const handleFloorSelect = (floor) => {
    // Toggle floor selection
    const newSelectedFloor = selectedFloor === floor ? null : floor;
    setSelectedFloor(newSelectedFloor);
    
    // Transmettre l'étage sélectionné au parent si la fonction est fournie
    if (onFloorSelect) {
      onFloorSelect(newSelectedFloor);
    }
    
    // Suppression de l'affichage automatique des salles sur mobile
    // if (isMobile && newSelectedFloor !== null && !showRooms) {
    //   setShowRooms(true);
    // }
  };
  
  const handleRoomSelect = (roomId) => {
    // Toggle room selection - si on clique sur la même salle, la désélectionner
    if (onRoomSelect) {
      onRoomSelect(selectedRoom === roomId ? null : roomId);
    }
  };
  
  const toggleShowRooms = () => {
    setShowRooms(!showRooms);
  };

  const handleAddRoom = () => {
    // Si un étage est sélectionné, on le passe en paramètre pour le présélectionner
    if (selectedFloor) {
      router.push(`/room/new?floor=${selectedFloor}`);
    } else {
      router.push('/room/new');
    }
  };

  // Handle context menu open for rooms
  const handleRoomContextMenu = (event, roomId) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
    setSelectedContextRoom(roomId);
  };
  
  // Handle touch start for long press on mobile
  const handleRoomTouchStart = (event, roomId) => {
    touchStartRef.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
    
    // Set a timer for long press
    longPressTimerRef.current = setTimeout(() => {
      setContextMenu({
        mouseX: touchStartRef.current.x,
        mouseY: touchStartRef.current.y,
      });
      setSelectedContextRoom(roomId);
    }, 500); // 500ms for long press
  };
  
  // Handle touch move to cancel long press if the user is scrolling
  const handleRoomTouchMove = (event) => {
    const moveThreshold = 10; // pixels
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    
    // Calculate distance moved
    const distance = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
    
    // If moved more than threshold, cancel long press
    if (distance > moveThreshold && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  // Handle touch end to clear the timer
  const handleRoomTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  // Handle context menu close
  const handleContextMenuClose = () => {
    setContextMenu(null);
  };
  
  // Navigate to room page
  const navigateToRoom = () => {
    if (selectedContextRoom) {
      router.push(`/room/${selectedContextRoom}`);
    }
    handleContextMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <Typography variant="body1" color="error">Error loading floor data: {error}</Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.7, color: 'white' }}>
          Please check network connection and try again
        </Typography>
      </Box>
    );
  }

  // Filter rooms to display based on selected floor, or show all if no floor selected
  const roomsToDisplay = selectedFloor ? roomsByFloor[selectedFloor] || [] : rooms;

  // Définir un minimum de 6 éléments pour maintenir la disposition
  const minRoomsForDisplay = 6;
  // Calculer combien d'éléments "fantômes" sont nécessaires
  const paddingElementsCount = roomsToDisplay.length < minRoomsForDisplay 
    ? minRoomsForDisplay - roomsToDisplay.length 
    : 0;
  // Créer un tableau d'éléments "fantômes" si nécessaire
  const paddingElements = paddingElementsCount > 0 
    ? Array(paddingElementsCount).fill(null).map((_, i) => `padding-${i}`) 
    : [];
    
  // Déterminer la taille du bouton Toggle en fonction du nombre d'étages
  // et de la position du dernier dans la grille
  const floorsCount = floors.length;
  const buttonPosition = floorsCount % 3; // Reste de la division par 3 (0, 1 ou 2)
  
  let toggleButtonWidth = 'single'; // Par défaut : 1/3 de la largeur
  
  if (buttonPosition === 0) {
    // Si le dernier étage est aligné à droite (dernier élément d'une ligne de 3)
    // le bouton prendra une ligne complète
    toggleButtonWidth = 'full';
  } else if (buttonPosition === 1) {
    // Si le dernier étage est aligné à gauche (premier élément d'une ligne)
    // le bouton prendra 2/3 de la ligne
    toggleButtonWidth = 'double';
  } else if (buttonPosition === 2) {
    // Si le dernier étage est au milieu (deuxième élément d'une ligne)
    // le bouton prendra 1/3 de la ligne
    toggleButtonWidth = 'single';
  }

  // Déterminer la taille du bouton d'ajout de room
  const addRoomButtonWidth = buttonPosition === 0 ? 'full' : 
                            buttonPosition === 1 ? 'double' : 'single';

  return (
    <>
      {/* Section title for Floors */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1,
        mt: 1,
        width: '100%'
      }}>
        <Typography variant="subtitle1" sx={{ 
          color: 'white', 
          fontWeight: 'medium',
          fontSize: { xs: '0.9rem', sm: '1rem' },
          display: 'flex',
          alignItems: 'center'
        }}>
          <StairsIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
          Museum Floors
        </Typography>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: { xs: '0.7rem', sm: '0.8rem' } 
        }}>
          {floors.length} floors available
        </Typography>
      </Box>

      {/* Floor buttons container */}
      <Box 
        sx={{ 
          mb: isMobile ? 2 : 3, 
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          width: '100%',
        }}
      >
        {floors.map(floor => (
          <Tooltip 
            key={floor} 
            title={`${roomsByFloor[floor]?.length || 0} rooms on Floor ${floor}`}
            arrow
          >
            <FloorButton 
              isactive={(selectedFloor === floor).toString()}
              onClick={() => handleFloorSelect(floor)}
              sx={{ 
                margin: { xs: '3px', sm: '4px' },
                minWidth: { xs: '90px', sm: '100px' },
                flexGrow: 0,
                flexBasis: { xs: 'calc(33.33% - 6px)', sm: 'calc(25% - 8px)', md: 'calc(20% - 8px)', lg: 'auto' }
              }}
            >
              <NotificationBadge
                badgeContent={roomsByFloor[floor]?.length || 0}
                color="primary"
                max={99}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StairsIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body2" noWrap>
                    Floor {floor}
                  </Typography>
                </Box>
              </NotificationBadge>
            </FloorButton>
          </Tooltip>
        ))}
        
        {/* Bouton pour afficher/masquer les salles (visible uniquement sur mobile/tablette) */}
        {(isMobile || isTablet) && (
          <ToggleRoomsButton 
            buttonwidth={toggleButtonWidth} 
            onClick={toggleShowRooms}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {showRooms ? (
                <>
                  <VisibilityOffIcon fontSize="small" sx={{ mr: toggleButtonWidth !== 'single' ? 1 : 0, opacity: 0.9 }} />
                  {toggleButtonWidth !== 'single' && (
                    <Typography variant="body2" noWrap>
                      Hide Rooms
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <VisibilityIcon fontSize="small" sx={{ mr: toggleButtonWidth !== 'single' ? 1 : 0, opacity: 0.9 }} />
                  {toggleButtonWidth !== 'single' && (
                    <Typography variant="body2" noWrap>
                      Show Rooms
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </ToggleRoomsButton>
        )}
        
        {/* Bouton d'ajout de room sur mobile/tablette - même style que le bouton toggle */}
        {(isMobile || isTablet) && (
          <ToggleRoomsButton 
            buttonwidth={addRoomButtonWidth} 
            onClick={handleAddRoom}
            sx={{
              backgroundColor: 'rgba(13, 110, 253, 0.2)',
              border: '1px dashed rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(13, 110, 253, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AddIcon fontSize="small" sx={{ mr: 1, opacity: 0.9 }} />
              <Typography variant="body2" noWrap sx={{ 
                display: 'block', // Toujours afficher le texte
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: { xs: '0.75rem', sm: '0.8rem' }
              }}>
                Add Room
              </Typography>
            </Box>
          </ToggleRoomsButton>
        )}
      </Box>
      
      {/* Section title for Rooms - only visible when rooms are shown */}
      {(!isMobile || showRooms) && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1,
          mt: 1,
          width: '100%'
        }}>
          <Typography variant="subtitle1" sx={{ 
            color: 'white', 
            fontWeight: 'medium',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            display: 'flex',
            alignItems: 'center'
          }}>
            <MeetingRoomIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
            {selectedFloor ? `Rooms on Floor ${selectedFloor}` : 'All Museum Rooms'}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: { xs: '0.7rem', sm: '0.8rem' } 
          }}>
            {roomsToDisplay.length} {roomsToDisplay.length === 1 ? 'room' : 'rooms'} total
          </Typography>
        </Box>
      )}
      
      {/* Rooms grid - visible conditionnellement sur mobile */}
      {(!isMobile || showRooms) && (
        <Grid 
          container 
          spacing={isMobile ? 1 : 2}
          sx={{ 
            width: '100%',
            // Sur mobile, on utilise un flex container pour plus de contrôle
            ...(isMobile && {
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            })
          }}
        >
          {roomsToDisplay.length > 0 ? (
            <>
              {roomsToDisplay.map((room) => (
                <Grid 
                  item 
                  xs={6} 
                  sm={4} 
                  md={3} 
                  lg={2} 
                  key={room.id}
                  sx={{
                    // Sur mobile, assurer une largeur de 48% pour laisser un peu d'espace entre les cartes
                    ...(isMobile && {
                      width: 'calc(50% - 8px)',
                      maxWidth: 'calc(50% - 8px)',
                      flexBasis: 'calc(50% - 8px)',
                      flexGrow: 0,
                      margin: '4px 0',
                      padding: 0, // Supprimer le padding par défaut du Grid item
                    })
                  }}
                >
                  <RoomCard 
                    isactive={(selectedRoom === room.id).toString()}
                    onClick={() => handleRoomSelect(room.id)}
                    onContextMenu={(e) => handleRoomContextMenu(e, room.id)}
                    onTouchStart={(e) => handleRoomTouchStart(e, room.id)}
                    onTouchMove={handleRoomTouchMove}
                    onTouchEnd={handleRoomTouchEnd}
                    onTouchCancel={handleRoomTouchEnd}
                  >
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        width: '100%', 
                      }}>
                        <MeetingRoomIcon sx={{ fontSize: '1.2rem', mr: 1, opacity: 0.7, flexShrink: 0, mt: '2px' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                            width: 'calc(100% - 50px)', // Give enough space for the chip
                            lineHeight: '1.2'
                          }}
                        >
                          {room.name || `Room ${room.id}`}
                        </Typography>
                        
                        <Chip 
                          label={objectTypesByRoom[room.id] || 0}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 22, 
                            minWidth: 30,
                            fontSize: '0.7rem',
                            borderColor: 'rgba(255,255,255,0.2)',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: objectTypesByRoom[room.id] > 0 ? 'rgba(33, 150, 243, 0.15)' : 'transparent'
                          }}
                          title={`${objectTypesByRoom[room.id] || 0} unique object ${objectTypesByRoom[room.id] !== 1 ? 'types' : 'type'}`}
                        />
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          mt: 'auto'
                        }}
                      >
                        {room.roomtype || 'Unknown type'} • {objectTypesByRoom[room.id] || 0} object {objectTypesByRoom[room.id] !== 1 ? 'types' : 'type'}
                      </Typography>
                    </Box>
                  </RoomCard>
                </Grid>
              ))}
              
              {/* Bouton d'ajout de room en version desktop - visible uniquement si pas mobile ou si showRooms est true */}
              {!isMobile && (
                <Grid 
                  item 
                  xs={6} 
                  sm={4} 
                  md={3} 
                  lg={2} 
                  sx={{
                    ...(isMobile && {
                      width: 'calc(50% - 8px)',
                      maxWidth: 'calc(50% - 8px)',
                      flexBasis: 'calc(50% - 8px)',
                      flexGrow: 0,
                      margin: '4px 0',
                      padding: 0,
                    })
                  }}
                >
                  <AddRoomCard onClick={handleAddRoom}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <Box 
                        className="add-icon-wrapper"
                        sx={{ 
                          mb: 1,
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <AddIcon sx={{ fontSize: '2rem', color: 'white' }} />
                      </Box>
                      
                      <Typography 
                        className="add-room-text"
                        variant="body2"
                        sx={{ 
                          color: 'white',
                          fontSize: '0.85rem',
                          fontWeight: 'medium',
                          mt: 1,
                          opacity: 0,
                          transition: 'all 0.3s ease',
                          transform: 'translateY(8px)'
                        }}
                      >
                        Add Room
                      </Typography>
                    </Box>
                  </AddRoomCard>
                </Grid>
              )}
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <Typography sx={{ color: 'white', textAlign: 'center', p: 3 }}>
                  {selectedFloor ? `No rooms found on Floor ${selectedFloor}` : 'No rooms found'}
                </Typography>
              </Grid>
              
              {/* Bouton d'ajout de room même si aucune room n'existe */}
              {!isMobile && (
                <Grid 
                  item 
                  xs={12}
                  sx={{ 
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center' 
                  }}
                >
                  <AddRoomCard 
                    onClick={handleAddRoom}
                    sx={{
                      width: '200px',
                      height: '120px'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <Box 
                        className="add-icon-wrapper"
                        sx={{ 
                          mb: 1,
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <AddIcon sx={{ fontSize: '2rem', color: 'white' }} />
                      </Box>
                      
                      <Typography 
                        className="add-room-text"
                        variant="body2"
                        sx={{ 
                          color: 'white',
                          fontSize: '0.85rem',
                          fontWeight: 'medium',
                          mt: 1,
                          opacity: 0,
                          transition: 'all 0.3s ease',
                          transform: 'translateY(8px)'
                        }}
                      >
                        Add First Room
                      </Typography>
                    </Box>
                  </AddRoomCard>
                </Grid>
              )}
            </>
          )}
          
          {/* Éléments de remplissage invisibles pour maintenir la disposition */}
          {paddingElements.map(key => (
            <Grid 
              item 
              xs={6} 
              sm={4} 
              md={3} 
              lg={2} 
              key={key} 
              sx={{ 
                visibility: 'hidden', 
                pointerEvents: 'none',
                // Sur mobile, ajuster également la largeur des éléments fantômes
                ...(isMobile && {
                  width: 'calc(50% - 8px)',
                  maxWidth: 'calc(50% - 8px)',
                  flexBasis: 'calc(50% - 8px)',
                  flexGrow: 0,
                  margin: '4px 0',
                  padding: 0
                })
              }}
            >
              <Box sx={{ height: 0 }} />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            minWidth: '100px', // Petit menu
            padding: 0, // Pas de padding
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)', // Ombre légère
            backgroundColor: 'rgba(30, 30, 40, 0.95)', // Thème sombre de l'app
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)', // Bordure fine
          }
        }}
      >
        <MenuItem 
          onClick={navigateToRoom}
          sx={{ 
            fontSize: '0.8rem', // Texte plus petit
            py: 0.5, // Moins de padding vertical
            px: 1, // Moins de padding horizontal
            minHeight: '28px', // Hauteur totale plus petite
            borderRadius: 0, // Pas de coins arrondis
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.2)', // Effet hover du thème
            }
          }}
        >
          <LaunchIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.8rem' }} />
          Go to
        </MenuItem>
      </Menu>
    </>
  );
};

export default FloorOverview; 