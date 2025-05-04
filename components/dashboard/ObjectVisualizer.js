"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Chip,
  Tooltip,
  Card,
  CardContent,
  IconButton,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import PaletteIcon from '@mui/icons-material/Palette';
import ChairIcon from '@mui/icons-material/Chair';
import CameraIcon from '@mui/icons-material/Camera';
import DiamondIcon from '@mui/icons-material/Diamond';
import CategoryIcon from '@mui/icons-material/Category';
import BrushIcon from '@mui/icons-material/Brush';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import SculptureIcon from '@mui/icons-material/Gesture';
import BookIcon from '@mui/icons-material/MenuBook';
import LightbulbIcon from '@mui/icons-material/EmojiObjects';
import WatchIcon from '@mui/icons-material/Watch';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ScienceIcon from '@mui/icons-material/Science';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import MapIcon from '@mui/icons-material/Map';
import DevicesIcon from '@mui/icons-material/Devices';
import FaceIcon from '@mui/icons-material/Face';
import TapasIcon from '@mui/icons-material/Tapas';
import CakeIcon from '@mui/icons-material/Cake';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

// Generate a consistent color based on string
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 80%, 65%)`;
};

// Styled components
const ObjectCard = styled(motion.div)(({ theme, color }) => ({
  backgroundColor: 'rgba(30, 30, 40, 0.8)',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid rgba(255,255,255,0.1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    '& .object-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    backgroundColor: color || theme.palette.primary.main,
  }
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  backgroundColor: color ? `${color}15` : 'rgba(255,255,255,0.05)',
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
}));

const FilterTag = styled(Chip)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.primary.main : 'rgba(30, 30, 40, 0.6)',
  color: selected ? theme.palette.primary.contrastText : 'white',
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : 'rgba(60, 60, 70, 0.8)',
  }
}));

// Main component
const ObjectVisualizer = ({ objects, onTypeSelect, selectedType, selectedRoom }) => {
  const [loading, setLoading] = useState(true);
  const [objectTypes, setObjectTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filters, setFilters] = useState([]);
  
  // Get icon based on object type
  const getObjectIcon = (type) => {
    if (!type) return <CategoryIcon fontSize="large" />;
    
    const lowercaseType = type.toLowerCase();
    
    // Map of common museum object types to appropriate icons
    if (lowercaseType.includes('paint') || lowercaseType.includes('tableau') || lowercaseType.includes('canvas')) {
      return <PaletteIcon fontSize="large" color="primary" />;
    } else if (lowercaseType.includes('chair') || lowercaseType.includes('furniture') || lowercaseType.includes('meuble') || lowercaseType.includes('table') || lowercaseType.includes('sofa')) {
      return <ChairIcon fontSize="large" color="secondary" />;
    } else if (lowercaseType.includes('photo') || lowercaseType.includes('camera') || lowercaseType.includes('film')) {
      return <CameraIcon fontSize="large" style={{ color: '#ffeb3b' }} />;
    } else if (lowercaseType.includes('jewel') || lowercaseType.includes('gem') || lowercaseType.includes('gold') || lowercaseType.includes('silver') || lowercaseType.includes('bijou')) {
      return <DiamondIcon fontSize="large" style={{ color: '#80deea' }} />;
    } else if (lowercaseType.includes('sculpt') || lowercaseType.includes('statue') || lowercaseType.includes('buste')) {
      return <SculptureIcon fontSize="large" style={{ color: '#b39ddb' }} />;
    } else if (lowercaseType.includes('book') || lowercaseType.includes('livre') || lowercaseType.includes('manuscript')) {
      return <BookIcon fontSize="large" style={{ color: '#a1887f' }} />;
    } else if (lowercaseType.includes('lamp') || lowercaseType.includes('light') || lowercaseType.includes('éclairage')) {
      return <LightbulbIcon fontSize="large" style={{ color: '#fff176' }} />;
    } else if (lowercaseType.includes('watch') || lowercaseType.includes('clock') || lowercaseType.includes('montre') || lowercaseType.includes('horloge')) {
      return <WatchIcon fontSize="large" style={{ color: '#ff8a65' }} />;
    } else if (lowercaseType.includes('music') || lowercaseType.includes('instrument') || lowercaseType.includes('audio')) {
      return <MusicNoteIcon fontSize="large" style={{ color: '#ce93d8' }} />;
    } else if (lowercaseType.includes('science') || lowercaseType.includes('laboratory') || lowercaseType.includes('experiment')) {
      return <ScienceIcon fontSize="large" style={{ color: '#4fc3f7' }} />;
    } else if (lowercaseType.includes('architecture') || lowercaseType.includes('model') || lowercaseType.includes('blueprint')) {
      return <ArchitectureIcon fontSize="large" style={{ color: '#aed581' }} />;
    } else if (lowercaseType.includes('map') || lowercaseType.includes('carte') || lowercaseType.includes('atlas')) {
      return <MapIcon fontSize="large" style={{ color: '#ffd54f' }} />;
    } else if (lowercaseType.includes('electronic') || lowercaseType.includes('device') || lowercaseType.includes('computer')) {
      return <DevicesIcon fontSize="large" style={{ color: '#90a4ae' }} />;
    } else if (lowercaseType.includes('mask') || lowercaseType.includes('costume') || lowercaseType.includes('clothing')) {
      return <FaceIcon fontSize="large" style={{ color: '#ffcc80' }} />;
    } else if (lowercaseType.includes('food') || lowercaseType.includes('cuisine') || lowercaseType.includes('dish')) {
      return <TapasIcon fontSize="large" style={{ color: '#ef9a9a' }} />;
    } else if (lowercaseType.includes('pastry') || lowercaseType.includes('dessert') || lowercaseType.includes('sweet')) {
      return <CakeIcon fontSize="large" style={{ color: '#f48fb1' }} />;
    } else if (lowercaseType.includes('gift') || lowercaseType.includes('souvenir') || lowercaseType.includes('memorabilia')) {
      return <CardGiftcardIcon fontSize="large" style={{ color: '#ba68c8' }} />;
    } else if (lowercaseType.includes('flower') || lowercaseType.includes('plant') || lowercaseType.includes('botanical')) {
      return <LocalFloristIcon fontSize="large" style={{ color: '#81c784' }} />;
    } else if (lowercaseType.includes('sport') || lowercaseType.includes('game') || lowercaseType.includes('athletic')) {
      return <SportsSoccerIcon fontSize="large" style={{ color: '#4dd0e1' }} />;
    } else if (lowercaseType.includes('document') || lowercaseType.includes('archive') || lowercaseType.includes('history')) {
      return <AutoStoriesIcon fontSize="large" style={{ color: '#bcaaa4' }} />;
    } else if (lowercaseType.includes('art') || lowercaseType.includes('brush') || lowercaseType.includes('tool')) {
      return <BrushIcon fontSize="large" style={{ color: '#ef5350' }} />;
    } else {
      return <CategoryIcon fontSize="large" style={{ color: '#e0e0e0' }} />;
    }
  };

  useEffect(() => {
    if (Array.isArray(objects)) {
      // Process and group objects by type
      const types = [];
      const typeMap = new Map();
      
      objects.forEach(obj => {
        if (!obj) return;
        
        const type = obj.brand || "Unknown";
        
        if (!typeMap.has(type)) {
          const objectsOfType = selectedRoom 
            ? objects.filter(o => o.brand === type && o.room_id === selectedRoom)
            : objects.filter(o => o.brand === type);
            
          typeMap.set(type, {
            type,
            count: objectsOfType.length,
            color: stringToColor(type),
            objects: objectsOfType
          });
        }
      });
      
      // Convert map to array and sort by count
      typeMap.forEach(typeData => {
        types.push(typeData);
      });
      
      types.sort((a, b) => b.count - a.count);
      
      // Get popular types for filter tags
      const popularTypes = types.slice(0, 5).map(t => t.type);
      setFilters(popularTypes);
      
      setObjectTypes(types);
      setFilteredTypes(types);
      setLoading(false);
    }
  }, [objects, selectedRoom]);
  
  // Effect to update filtered types when the selected room changes
  useEffect(() => {
    if (Array.isArray(objects)) {
      // If a room is selected, filter object types to show only those in the room
      const filteredByRoom = selectedRoom 
        ? objectTypes.map(typeData => {
            const objectsInRoom = typeData.objects.filter(obj => obj.room_id === selectedRoom);
            return {
              ...typeData,
              count: objectsInRoom.length,
              objects: objectsInRoom
            };
          }).filter(typeData => typeData.count > 0)
        : objectTypes;
        
      setFilteredTypes(filteredByRoom);
    }
  }, [selectedRoom, objectTypes, objects]);
  
  const handleSelectType = (type) => {
    onTypeSelect(type === selectedType ? null : type);
  };
  
  const handleFilterClick = (type) => {
    handleSelectType(type);
  };
  
  const clearFilters = () => {
    onTypeSelect(null);
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
          <ArtTrackIcon sx={{ mr: 1 }} /> Object Types
        </Typography>
        
        {selectedType && (
          <Chip 
            icon={<CategoryIcon />}
            label={selectedType}
            color="primary"
            variant="outlined"
            onDelete={clearFilters}
          />
        )}
      </Box>
      
      {/* Quick filters */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
          <FilterAltIcon sx={{ fontSize: '1rem', mr: 0.5, opacity: 0.7 }} />
          <Typography variant="caption" sx={{ mr: 1 }}>Quick Filters:</Typography>
        </Box>
        
        {filters.map(filter => (
          <FilterTag 
            key={filter}
            label={filter} 
            selected={selectedType === filter}
            onClick={() => handleFilterClick(filter)}
            size="small"
          />
        ))}
        
        {selectedType && (
          <Tooltip title="Clear filter">
            <IconButton 
              size="small" 
              onClick={clearFilters}
              sx={{ ml: 1, color: 'white' }}
            >
              <FilterAltOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* Visual object type grid */}
      <Paper sx={{ 
        p: 3, 
        bgcolor: 'rgba(20, 20, 30, 0.7)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        backgroundImage: 'url("/images/pattern-dots.svg")',
        backgroundRepeat: 'repeat',
        backgroundSize: '20px',
        backgroundBlendMode: 'overlay',
      }}>
        <Grid container spacing={2}>
          {filteredTypes.length > 0 ? (
            filteredTypes.map((typeData, index) => (
              typeData.count > 0 && (
                <Grid item xs={6} sm={4} md={3} lg={2} key={typeData.type}>
                  <ObjectCard 
                    color={typeData.color}
                    onClick={() => handleSelectType(typeData.type)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}>
                        <IconContainer className="object-icon" color={typeData.color}>
                          {getObjectIcon(typeData.type)}
                        </IconContainer>
                        
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            mt: 2,
                            fontWeight: 'bold',
                            color: selectedType === typeData.type ? typeData.color : 'white'
                          }}
                        >
                          {typeData.type}
                        </Typography>
                        
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: typeData.color,
                            mt: 1
                          }}
                        >
                          {typeData.count}
                        </Typography>
                        
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {typeData.count === 1 ? 'object' : 'objects'}
                          {selectedRoom ? ' in selected room' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </ObjectCard>
                </Grid>
              )
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                opacity: 0.7 
              }}>
                <Typography>No object types found in the selected room</Typography>
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  startIcon={<FilterAltOffIcon />}
                  sx={{ mt: 2 }}
                >
                  Clear Room Filter
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ObjectVisualizer; 