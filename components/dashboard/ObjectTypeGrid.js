"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Chip,
  useMediaQuery,
  CircularProgress,
  Collapse,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

// Import des icônes pour les types d'objets
import SensorsIcon from '@mui/icons-material/Sensors';
import DevicesIcon from '@mui/icons-material/Devices';
import CategoryIcon from '@mui/icons-material/Category';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import VideocamIcon from '@mui/icons-material/Videocam';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import CountertopsIcon from '@mui/icons-material/Countertops';
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter';
import CastConnectedIcon from '@mui/icons-material/CastConnected';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';

// Styled component for type cards
const TypeCard = styled(Paper)(({ theme, color }) => ({
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: color || 'rgba(30, 30, 40, 0.8)',
  color: 'white',
  borderRadius: 0,
  height: '100%',
  position: 'relative',
  transition: 'all 0.2s ease',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '& .type-info-desktop': {
      opacity: 1,
      height: 'auto',
      transform: 'translateY(0)',
      padding: '8px 0 0 0',
    }
  }
}));

// Badge for counts - style notification avec effet débordant
const TypeBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute', 
  top: -10, 
  right: -10,
  height: 20,
  minWidth: 20,
  fontSize: '0.7rem',
  backgroundColor: '#2196f3',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  padding: 0,
  zIndex: 2,
  '& .MuiChip-label': {
    padding: '0 6px',
  }
}));

// Partie expandable qui apparaît au hover sur desktop
const TypeInfoDesktop = styled(Box)(({ theme }) => ({
  width: '100%',
  opacity: 0,
  height: 0,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  transform: 'translateY(10px)',
  borderTop: '1px solid rgba(255,255,255,0.15)',
  marginTop: '8px',
}));

// Partie expandable qui apparaît au clic sur mobile
const TypeInfoMobile = styled(Box)(({ theme }) => ({
  width: '100%',
  borderTop: '1px solid rgba(255,255,255,0.15)',
  marginTop: '8px',
  padding: '8px 0 0 0',
}));

// Bouton d'ajout avec animation comme TypeCard
const AddTypeCard = styled(Paper)(({ theme, color }) => ({
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: color || 'rgba(13, 110, 253, 0.2)',
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
      backgroundColor: color ? color.replace('0.2', '0.3') : 'rgba(13, 110, 253, 0.3)',
      '& .add-type-info': {
        opacity: 1,
        height: 'auto',
        transform: 'translateY(0)',
        padding: '8px 0 0 0',
      },
      '& .add-icon-wrapper': {
        transform: 'translateY(-10px)'
      }
    }
  },
  // Effet active pour mobile (au clic)
  '@media (max-width: 599px)': {
    '&:active': {
      backgroundColor: color ? color.replace('0.2', '0.4') : 'rgba(13, 110, 253, 0.4)',
      borderColor: 'rgba(255, 255, 255, 0.6)',
    }
  }
}));

// Animation pour "Add Type" qui apparaît au hover
const AddTypeInfo = styled(Box)(({ theme }) => ({
  width: '100%',
  opacity: 0,
  height: 0,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  transform: 'translateY(10px)',
  borderTop: '1px solid rgba(255,255,255,0.15)',
  marginTop: '8px',
  textAlign: 'center'
}));

// Bouton d'ajout d'instance avec animation (style identique à AddTypeCard)
const AddInstanceCard = styled(Paper)(({ theme }) => ({
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: 'rgba(76, 175, 80, 0.2)', // Couleur verte
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
      backgroundColor: 'rgba(76, 175, 80, 0.3)',
      '& .add-instance-info': {
        opacity: 1,
        height: 'auto',
        transform: 'translateY(0)',
        padding: '8px 0 0 0',
      },
      '& .add-icon-wrapper': {
        transform: 'translateY(-10px)'
      }
    }
  },
  // Effet active pour mobile (au clic)
  '@media (max-width: 599px)': {
    '&:active': {
      backgroundColor: 'rgba(76, 175, 80, 0.4)',
      borderColor: 'rgba(255, 255, 255, 0.6)',
    }
  }
}));

// Animation pour "Add Instance" qui apparaît au hover
const AddInstanceInfo = styled(Box)(({ theme }) => ({
  width: '100%',
  opacity: 0,
  height: 0,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  transform: 'translateY(10px)',
  borderTop: '1px solid rgba(255,255,255,0.15)',
  marginTop: '8px',
  textAlign: 'center'
}));

// Bouton spécial pour Add Instance avec style différent
const InstanceButton = styled(Paper)(({ theme }) => ({
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: 'rgba(76, 175, 80, 0.2)', // Couleur verte
  color: 'white',
  borderRadius: 0,
  position: 'relative',
  transition: 'all 0.2s ease',
  border: '1px dashed rgba(255, 255, 255, 0.3)',
  margin: '4px 0',
  height: '100%',
  // Effets de survol uniquement sur desktop
  '@media (min-width: 600px)': {
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      transform: 'translateY(-3px)',
      '& .instance-plus': {
        opacity: 0,
        transform: 'translateY(-10px)'
      },
      '& .instance-text': {
        opacity: 1,
        transform: 'translateY(0)'
      }
    }
  },
  // Effet active pour mobile (au clic)
  '@media (max-width: 599px)': {
    '&:active': {
      backgroundColor: 'rgba(76, 175, 80, 0.4)',
      borderColor: 'rgba(255, 255, 255, 0.6)',
    }
  }
}));

// Function to generate pastel colors based on type name
const generateColor = (typeName) => {
  // Simple hash function for string
  let hash = 0;
  for (let i = 0; i < typeName.length; i++) {
    hash = typeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with consistent lightness and saturation
  const h = Math.abs(hash) % 360;
  const s = 40 + (Math.abs(hash) % 20); // 40-60% saturation
  const l = 30 + (Math.abs(hash) % 15); // 30-45% lightness - darker for better contrast with white text
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Function to split camelCase or PascalCase into separate words
const splitCamelCase = (text) => {
  if (!text) return ['Unknown'];
  return text
    // Insert a space before capital letters
    .replace(/([A-Z])/g, ' $1')
    // Trim leading space and split by space
    .trim()
    .split(' ');
};

// Fonction pour retourner l'icône correspondant au type d'objet
const getObjectTypeIcon = (type) => {
  if (!type) return <CategoryIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
  
  switch (type) {
    case 'SmokeDetector':
      return <SensorsIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'ElectrochromicGlass':
      return <CountertopsIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'NFCTag':
      return <CastConnectedIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'VisitorCounter':
      return <AccessibilityIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'SmartLock':
      return <DoorSlidingIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'ClimateMonitor':
      return <ThermostatIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'SmartLighting':
      return <WbSunnyIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'SmartCamera':
      return <VideocamIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'AutonomousTrain':
      return <SettingsRemoteIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'AudioAtmosphere':
      return <MusicNoteIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'SmartPlug':
      return <ElectricMeterIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    case 'AudioGuide':
      return <MusicNoteIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
    default:
      // Utiliser DevicesIcon comme icône par défaut pour tous les nouveaux types d'objets
      return <DevicesIcon sx={{ fontSize: '1.5rem', opacity: 0.9 }} />;
  }
};

const ObjectTypeGrid = ({ objects, objectData, selectedRoom, selectedFloor, onTypeSelect, selectedType, rooms }) => {
  const [types, setTypes] = useState([]);
  const [typeStats, setTypeStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  const [expandedType, setExpandedType] = useState(null);
  const router = useRouter();

  // Using fixed breakpoint values
  const isMobile = useMediaQuery('(max-width:600px)');
  
  useEffect(() => {
    setLoading(true);
    
    if (!Array.isArray(objectData)) {
      console.error("Invalid data format: objectData not array", { objectData });
      setLoading(false);
      return;
    }

    try {
      // CRITICAL DATA STRUCTURE INSIGHT:
      // 'objects' doesn't have floor property, but 'rooms' does (added in dashboard/page.js)
      const roomsArray = Array.isArray(rooms) ? rooms : [];
      
      console.log("Starting object type processing with:", {
        objectDataCount: objectData.length,
        roomsCount: roomsArray.length
      });

      // Initialize data structures for counting
      const typeData = {};
      
      // CASE 1: Room selected - show objects for this specific room only
      if (selectedRoom) {
        // Get all object instances in this room
        const roomInstances = objectData.filter(instance => 
          instance.room_id === selectedRoom
        );
        
        console.log(`Found ${roomInstances.length} instances in room ${selectedRoom}`);
        
        // Process each instance to count by type
        roomInstances.forEach(instance => {
          const type = instance.type_Object;
          if (!type) return; // Skip instances with no type
          
          // Initialize type entry if needed
          if (!typeData[type]) {
            typeData[type] = {
              count: 0,
              rooms: new Set()
            };
          }
          
          // Count this instance
          typeData[type].count++;
          // Add its room to the set of rooms for this type
          typeData[type].rooms.add(instance.room_id);
        });
      }
      // CASE 2: Floor selected - show objects for all rooms on this floor
      else if (selectedFloor && roomsArray.length > 0) {
        // Find rooms on this floor from the rooms array (not objects array)
        const roomsOnFloor = roomsArray.filter(room => 
          room.floor !== undefined && String(room.floor) === String(selectedFloor)
        );
        
        const debug = {
          selectedFloor,
          roomsArrayLength: roomsArray.length,
          roomsFoundOnFloor: roomsOnFloor.length,
          roomIdsOnFloor: roomsOnFloor.map(r => r.id),
          roomNamesOnFloor: roomsOnFloor.map(r => r.name || `Room ${r.id}`)
        };
        
        console.log(`Found ${roomsOnFloor.length} rooms on floor ${selectedFloor}:`, 
          roomsOnFloor.map(r => r.name || `Room ${r.id}`));
        
        // Get object instances for all rooms on this floor
        const floorInstances = objectData.filter(instance => 
          roomsOnFloor.some(room => room.id === instance.room_id)
        );
        
        debug.instancesFoundInFloor = floorInstances.length;
        
        // Process each instance to count by type
        floorInstances.forEach(instance => {
          const type = instance.type_Object;
          if (!type) return; // Skip instances with no type
          
          // Initialize type entry if needed
          if (!typeData[type]) {
            typeData[type] = {
              count: 0,
              rooms: new Set()
            };
          }
          
          // Count this instance
          typeData[type].count++;
          // Add its room to the set of rooms for this type
          if (instance.room_id) {
            typeData[type].rooms.add(instance.room_id);
          }
        });
        
        debug.typesFound = Object.keys(typeData).length;
        setDebugInfo(debug);
      }
      // CASE 3: No filters - show all object types
      else {
        // Process each instance to count by type
        objectData.forEach(instance => {
          const type = instance.type_Object;
          if (!type) return; // Skip instances with no type
          
          // Initialize type entry if needed
          if (!typeData[type]) {
            typeData[type] = {
              count: 0,
              rooms: new Set()
            };
          }
          
          // Count this instance
          typeData[type].count++;
          // Add its room to the set of rooms for this type
          if (instance.room_id) {
            typeData[type].rooms.add(instance.room_id);
          }
        });
      }
      
      // Convert the typeData to the format needed for rendering
      const uniqueTypes = Object.keys(typeData);
      const stats = {};
      
      uniqueTypes.forEach(type => {
        stats[type] = {
          objectCount: typeData[type].count,
          roomCount: typeData[type].rooms.size,
          color: generateColor(type)
        };
      });
      
      // Update component state
      setTypes(uniqueTypes);
      setTypeStats(stats);
    } catch (error) {
      console.error("Error processing object types:", error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  }, [objects, objectData, selectedRoom, selectedFloor, rooms]);
  
  const handleTypeClick = (type) => {
    if (onTypeSelect) {
      // Toggle selection if already selected
      onTypeSelect(selectedType === type ? null : type);
    }
    
    // On mobile, toggle expanded state for this type
    if (isMobile) {
      setExpandedType(expandedType === type ? null : type);
    }
  };
  
  const handleAddObjectType = () => {
    router.push('/object/new');
  };
  
  const handleAddObjectInstance = () => {
    // Plus de préselection du type, redirection simple
    router.push('/objectInstance/new');
  };
  
  // Déterminer si le bouton add type sera seul sur une nouvelle ligne
  const isAddButtonOnOwnRow = isMobile && types.length % 2 === 0;
  
  if (loading) {
    return (
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={30} sx={{ color: 'white' }} />
        <Typography sx={{ color: 'white', ml: 2 }}>
          Loading object types...
        </Typography>
      </Box>
    );
  }
  
  if (types.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography sx={{ color: 'white', textAlign: 'center' }}>
          {selectedRoom ? 
            `No object types found in the selected room` : 
            selectedFloor ? 
              `No object types found on Floor ${selectedFloor}` : 
              'No object types found'}
        </Typography>
        {debugInfo && (
          <Typography 
            sx={{ 
              color: 'rgba(255,255,255,0.6)', 
              textAlign: 'center', 
              fontSize: '0.75rem', 
              mt: 1,
              px: 2,
              wordBreak: 'break-word'
            }}
          >
            Debug Info: {JSON.stringify(debugInfo)}
          </Typography>
        )}
      </Box>
    );
  }
  
  return (
    <>
      {/* Section title for Object Types */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1,
        mt: 2
      }}>
        <Typography variant="subtitle1" sx={{ 
          color: 'white', 
          fontWeight: 'medium',
          fontSize: { xs: '0.9rem', sm: '1rem' },
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box 
            component="span" 
            sx={{ 
              width: 18, 
              height: 18, 
              borderRadius: '4px',
              mr: 1,
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.5), rgba(33, 150, 243, 0.8))',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '0.6rem',
              fontWeight: 'bold'
            }}
          >
            T
          </Box>
          {selectedRoom ? 
            `Object Types in Selected Room` : 
            selectedFloor ? 
              `Object Types on Floor ${selectedFloor}` : 
              'All Object Types'}
        </Typography>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: { xs: '0.7rem', sm: '0.8rem' } 
        }}>
          {types.length} {types.length === 1 ? 'type' : 'types'} available
        </Typography>
      </Box>
      
      <Grid 
        container 
        spacing={isMobile ? 1 : 2}
        sx={{ 
          width: '100%',
          ...(isMobile && {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          })
        }}
      >
        {types.map(type => {
          const stats = typeStats[type] || {};
          const nameParts = splitCamelCase(type);
          const isExpanded = expandedType === type;
          
          return (
            <Grid 
              item 
              xs={6} // 2 par ligne sur mobile (12/6 = 2)
              sm={4} 
              md={3} 
              lg={2} 
              key={type}
              sx={{
                // Sur mobile, assurer une largeur de 48% pour laisser un peu d'espace entre les cartes
                ...(isMobile && {
                  width: 'calc(50% - 8px)', // Presque la moitié moins un peu d'espace
                  maxWidth: 'calc(50% - 8px)',
                  flexBasis: 'calc(50% - 8px)',
                  flexGrow: 0,
                  margin: '4px 0',
                  padding: 0, // Supprimer le padding par défaut du Grid item
                })
              }}
            >
              <TypeCard 
                color={stats.color}
                onClick={() => handleTypeClick(type)}
                sx={{
                  border: selectedType === type ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: selectedType === type ? '0 0 15px rgba(255,255,255,0.3)' : 'none',
                  width: '100%', // Full width within the Grid item
                  height: '100%',
                  // Sur mobile
                  ...(isMobile && {
                    minHeight: '130px',
                    display: 'flex',
                    flexDirection: 'column',
                  })
                }}
              >
                <Box sx={{ textAlign: 'center', position: 'relative', width: '100%' }}>
                  <TypeBadge
                    label={stats.objectCount || 0}
                    size="small"
                  />
                  
                  <Box sx={{ mb: 1 }}>
                    {getObjectTypeIcon(type)}
                  </Box>
                  
                  {nameParts.length > 1 ? (
                    <>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                          // Ensure text fits on mobile
                          ...(isMobile && {
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          })
                        }}
                      >
                        {nameParts[0]}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          display: 'block',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          mt: 0.5,
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          // Ensure text fits on mobile
                          ...(isMobile && {
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          })
                        }}
                      >
                        {nameParts.slice(1).join(' ')}
                      </Typography>
                    </>
                  ) : (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        // Ensure text fits on mobile
                        ...(isMobile && {
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        })
                      }}
                    >
                      {type}
                    </Typography>
                  )}
                  
                  {/* Expand indicator for mobile */}
                  {isMobile && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mt: 1,
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.8rem'
                      }}
                    >
                      {isExpanded ? 
                        <ExpandLessIcon fontSize="small" /> : 
                        <ExpandMoreIcon fontSize="small" />
                      }
                    </Box>
                  )}
                  
                  {/* Information détaillée qui apparaît au hover sur desktop */}
                  {!isMobile && (
                    <TypeInfoDesktop className="type-info-desktop">
                      <Box sx={{ px: 1, py: 0.5, textAlign: 'left' }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            color: 'rgba(255,255,255,0.9)',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            pb: 0.5
                          }}
                        >
                          <strong>{stats.objectCount}</strong> instance{stats.objectCount !== 1 ? 's' : ''}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            color: 'rgba(255,255,255,0.9)', 
                            mt: 0.5
                          }}
                        >
                          <strong>{stats.roomCount}</strong> room{stats.roomCount !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </TypeInfoDesktop>
                  )}
                  
                  {/* Information détaillée qui apparaît au clic sur mobile */}
                  {isMobile && (
                    <Collapse in={isExpanded}>
                      <TypeInfoMobile>
                        <Box sx={{ px: 1, py: 0.5, textAlign: 'left' }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              color: 'rgba(255,255,255,0.9)',
                              borderBottom: '1px solid rgba(255,255,255,0.1)',
                              pb: 0.5
                            }}
                          >
                            <strong>{stats.objectCount}</strong> instance{stats.objectCount !== 1 ? 's' : ''}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              color: 'rgba(255,255,255,0.9)', 
                              mt: 0.5
                            }}
                          >
                            <strong>{stats.roomCount}</strong> room{stats.roomCount !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </TypeInfoMobile>
                    </Collapse>
                  )}
                </Box>
              </TypeCard>
            </Grid>
          );
        })}
        
        {/* Bouton d'ajout de type d'objet */}
        <Grid 
          item 
          xs={6}
          sm={4} 
          md={3} 
          lg={2} 
          sx={{
            ...(isMobile && {
              // Si seul sur une ligne, prendre toute la largeur, sinon 50%
              width: isAddButtonOnOwnRow ? '100%' : 'calc(50% - 8px)',
              maxWidth: isAddButtonOnOwnRow ? '100%' : 'calc(50% - 8px)',
              flexBasis: isAddButtonOnOwnRow ? '100%' : 'calc(50% - 8px)',
              flexGrow: 0,
              margin: '4px 0',
              padding: 0,
            })
          }}
        >
          <AddTypeCard 
            onClick={handleAddObjectType}
            sx={{
              // Si seul sur une ligne, hauteur réduite
              ...(isMobile && isAddButtonOnOwnRow && {
                padding: '10px 16px',
                minHeight: '60px',
                height: 'auto',
                flexDirection: 'row',
                justifyContent: 'center'
              }),
              // Pour le desktop, centrer verticalement le contenu
              ...(!isMobile && {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })
            }}
          >
            <Box sx={{ 
              textAlign: 'center', 
              position: 'relative', 
              width: '100%',
              // Si seul sur une ligne, changer la disposition en ligne
              ...(isMobile && isAddButtonOnOwnRow && {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }),
              // Pour le desktop, gérer l'animation verticale
              ...(!isMobile && {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              })
            }}>
              <Box 
                className="add-icon-wrapper"
                sx={{ 
                  mb: isMobile && isAddButtonOnOwnRow ? 0 : 1,
                  mr: isMobile && isAddButtonOnOwnRow ? 1 : 0,
                  transition: 'transform 0.3s ease'
                }}
              >
                <AddIcon sx={{ 
                  fontSize: isMobile && isAddButtonOnOwnRow ? '1.5rem' : '2rem', 
                  color: 'white' 
                }} />
              </Box>
              
              {/* Sur mobile, le texte est toujours visible */}
              {isMobile && (
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 'medium',
                    mt: isAddButtonOnOwnRow ? 0 : 1
                  }}
                >
                  Add Object Type
                </Typography>
              )}
              
              {/* Sur desktop, le texte apparaît au hover */}
              {!isMobile && (
                <AddTypeInfo className="add-type-info">
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: 'medium'
                    }}
                  >
                    Add Object Type
                  </Typography>
                </AddTypeInfo>
              )}
            </Box>
          </AddTypeCard>
        </Grid>
        
        {/* Bouton d'ajout d'instance d'objet */}
        <Grid 
          item 
          xs={12} // Prendre toute la largeur en mobile
          sm={4} 
          md={3} 
          lg={2} 
          sx={{
            ...(isMobile && {
              width: '100%',
              maxWidth: '100%',
              flexGrow: 0,
              margin: '4px 0',
              padding: 0,
            })
          }}
        >
          <AddInstanceCard 
            onClick={handleAddObjectInstance}
            sx={{
              // Si seul sur une ligne en mobile, hauteur réduite
              ...(isMobile && {
                padding: '10px 16px',
                minHeight: '60px',
                height: 'auto',
                flexDirection: 'row',
                justifyContent: 'center'
              }),
              // Pour le desktop, centrer verticalement le contenu
              ...(!isMobile && {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })
            }}
          >
            <Box sx={{ 
              textAlign: 'center', 
              position: 'relative', 
              width: '100%',
              // En mobile, disposition en ligne
              ...(isMobile && {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }),
              // Pour le desktop, gérer l'animation verticale
              ...(!isMobile && {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              })
            }}>
              <Box 
                className="add-icon-wrapper"
                sx={{ 
                  mb: isMobile ? 0 : 1,
                  mr: isMobile ? 1 : 0,
                  transition: 'transform 0.3s ease'
                }}
              >
                <AddIcon sx={{ 
                  fontSize: isMobile ? '1.5rem' : '2rem', 
                  color: 'white' 
                }} />
              </Box>
              
              {/* Sur mobile, le texte est toujours visible */}
              {isMobile && (
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 'medium',
                    mt: 0
                  }}
                >
                  Add object instance
                </Typography>
              )}
              
              {/* Sur desktop, afficher "+ instance" par défaut et "Add object instance" au hover */}
              {!isMobile && (
                <>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: 'medium'
                    }}
                  >
                    instance
                  </Typography>
                  
                  <AddInstanceInfo className="add-instance-info">
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 'medium'
                      }}
                    >
                      Add object instance
                    </Typography>
                  </AddInstanceInfo>
                </>
              )}
            </Box>
          </AddInstanceCard>
        </Grid>
      </Grid>
    </>
  );
};

export default ObjectTypeGrid; 