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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryIcon from '@mui/icons-material/Category';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SecurityIcon from '@mui/icons-material/Security';
import SensorsIcon from '@mui/icons-material/Sensors';
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CountertopsIcon from '@mui/icons-material/Countertops';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import DevicesIcon from '@mui/icons-material/Devices';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import CastConnectedIcon from '@mui/icons-material/CastConnected';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SortIcon from '@mui/icons-material/Sort';
import RoomIcon from '@mui/icons-material/Room';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// Styled components
const ObjectTypeCard = styled(motion.div)(({ theme, selected, color }) => ({
  background: selected 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(30, 30, 40, 0.9)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
  border: '1px solid',
  borderColor: selected ? theme.palette.primary.main : 'rgba(255,255,255,0.1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    borderColor: selected ? theme.palette.primary.main : 'rgba(255,255,255,0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    backgroundColor: color || theme.palette.primary.main,
  }
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  backgroundColor: color ? `${color}15` : 'rgba(255,255,255,0.05)',
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
}));

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: selected ? theme.palette.primary.main : 'rgba(30, 30, 40, 0.7)',
  color: selected ? theme.palette.primary.contrastText : 'white',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  fontSize: '0.75rem',
  height: '24px',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : 'rgba(60, 60, 70, 0.9)',
  }
}));

// Function to get a consistent color from string
const stringToColor = (str) => {
  if (!str) return '#9e9e9e'; // Default gray
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 75%, 65%)`;
};

// Get icon based on object type
const getObjectIcon = (type) => {
  if (!type) return <CategoryIcon color="disabled" />;
  
  const lowercaseType = type.toLowerCase();
  
  // Map to appropriate icons based on type
  if (lowercaseType.includes('capteur') && lowercaseType.includes('climat')) {
    return <ThermostatIcon style={{ color: '#4fc3f7' }} />;
  } else if (lowercaseType.includes('compteur') && lowercaseType.includes('visiteur')) {
    return <AccessibilityIcon style={{ color: '#81c784' }} />;
  } else if (lowercaseType.includes('serrure')) {
    return <DoorSlidingIcon style={{ color: '#ffb74d' }} />;
  } else if (lowercaseType.includes('prise')) {
    return <ElectricMeterIcon style={{ color: '#ff8a65' }} />;
  } else if (lowercaseType.includes('capteur') && lowercaseType.includes('lumière')) {
    return <WbSunnyIcon style={{ color: '#fff176' }} />;
  } else if (lowercaseType.includes('ambiance') && lowercaseType.includes('sonore')) {
    return <MusicNoteIcon style={{ color: '#ce93d8' }} />;
  } else if (lowercaseType.includes('vitre')) {
    return <CountertopsIcon style={{ color: '#90caf9' }} />;
  } else if (lowercaseType.includes('train')) {
    return <SettingsRemoteIcon style={{ color: '#a1887f' }} />;
  } else if (lowercaseType.includes('object')) {
    return <DevicesIcon style={{ color: '#9fa8da' }} />;
  } else if (lowercaseType.includes('capteur')) {
    return <SensorsIcon style={{ color: '#7986cb' }} />;
  } else {
    return <CategoryIcon style={{ color: '#e0e0e0' }} />;
  }
};

const EnhancedObjectGrid = ({ objects, objectData, selectedRoom, onTypeSelect, selectedType }) => {
  const [loading, setLoading] = useState(true);
  const [objectTypes, setObjectTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [sortOption, setSortOption] = useState('count'); // 'count', 'alpha', 'active'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'alert', 'inactive'
  
  // Menu controls
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Process objects data
  useEffect(() => {
    if (Array.isArray(objects)) {
      // Get all available rooms with objects
      const rooms = new Set();
      objects.forEach(obj => {
        if (obj?.room_id) {
          rooms.add(obj.room_id);
        }
      });
      setAvailableRooms(Array.from(rooms));
      
      // Process object types
      const types = [];
      const typeMap = new Map();
      
      // Group objects by type (using "type" field instead of "brand")
      objects.forEach(obj => {
        if (!obj) return;
        
        const type = obj.type || "Inconnu";
        
        if (!typeMap.has(type)) {
          // Count objects of this type
          const objectsOfType = selectedRoom 
            ? objects.filter(o => o.type === type && o.room_id === selectedRoom)
            : objects.filter(o => o.type === type);
          
          // Get status by checking object data 
          let status = 'normal';
          let activeCount = 0;
          
          if (Array.isArray(objectData)) {
            const typeIds = objectsOfType.map(o => o.id);
            const dataForType = objectData.filter(d => typeIds.includes(d.id));
            
            // Check status from object data
            dataForType.forEach(d => {
              const data = d.data || {};
              
              // If any object has an alert status, mark the type as alert
              if (data.Alerte === 'Oui' || data.État === 'Alerte' || 
                  data.Statut === 'Critique' || data.Batterie < '10%') {
                status = 'alert';
              } 
              // Count active objects
              if (data.État !== 'Inactif' && data.État !== 'Off' && 
                  data.Statut !== 'Inactif' && data.Mode !== 'Veille') {
                activeCount++;
              }
            });
            
            // If not alert but less than 50% active, mark as warning
            if (status !== 'alert' && activeCount < objectsOfType.length / 2 && activeCount > 0) {
              status = 'warning';
            }
          }
            
          typeMap.set(type, {
            type,
            count: objectsOfType.length,
            objects: objectsOfType,
            color: stringToColor(type),
            status,
            activeCount
          });
        }
      });
      
      // Convert map to array
      typeMap.forEach(typeData => {
        types.push(typeData);
      });
      
      // Apply sort option
      sortObjectTypes(types, sortOption);
      
      setObjectTypes(types);
      setFilteredTypes(types);
      setLoading(false);
    }
  }, [objects, selectedRoom, objectData]);
  
  // Handle sorting
  const sortObjectTypes = (types, option) => {
    switch (option) {
      case 'count':
        types.sort((a, b) => b.count - a.count);
        break;
      case 'alpha':
        types.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'active':
        types.sort((a, b) => b.activeCount - a.activeCount);
        break;
      default:
        types.sort((a, b) => b.count - a.count);
    }
    return types;
  };
  
  // Apply filters
  useEffect(() => {
    if (objectTypes.length > 0) {
      let filtered = [...objectTypes];
      
      // Apply status filter
      if (filterStatus !== 'all') {
        filtered = filtered.filter(typeData => {
          if (filterStatus === 'alert') return typeData.status === 'alert';
          if (filterStatus === 'active') return typeData.activeCount > 0;
          if (filterStatus === 'inactive') return typeData.activeCount === 0;
          return true;
        });
      }
      
      // Apply current sort
      sortObjectTypes(filtered, sortOption);
      
      setFilteredTypes(filtered);
    }
  }, [objectTypes, filterStatus, sortOption]);
  
  const handleSelectType = (type) => {
    onTypeSelect(type === selectedType ? null : type);
  };
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleSortChange = (option) => {
    setSortOption(option);
    handleMenuClose();
  };
  
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    handleMenuClose();
  };
  
  const handleClearFilters = () => {
    setFilterStatus('all');
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
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1.5
      }}>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontSize: '1rem'
        }}>
          <CategoryIcon sx={{ mr: 1 }} /> Types d'Objets
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {selectedType && (
            <Chip 
              size="small"
              icon={<CategoryIcon />}
              label={selectedType}
              color="primary"
              variant="outlined"
              onDelete={() => onTypeSelect(null)}
              sx={{ mr: 1 }}
            />
          )}
          
          <Tooltip title="Options de tri et filtrage">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ color: 'white' }}
            >
              <TuneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                bgcolor: 'rgba(30, 30, 40, 0.95)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                minWidth: '200px'
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, opacity: 0.7 }}>
              Trier par
            </Typography>
            <MenuItem onClick={() => handleSortChange('count')} selected={sortOption === 'count'}>
              <ListItemIcon>
                <SortIcon fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText>Nombre d'objets</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('alpha')} selected={sortOption === 'alpha'}>
              <ListItemIcon>
                <SortIcon fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText>Alphabétique</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('active')} selected={sortOption === 'active'}>
              <ListItemIcon>
                <SortIcon fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText>Objets actifs</ListItemText>
            </MenuItem>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
            
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, opacity: 0.7 }}>
              Filtrer par statut
            </Typography>
            <MenuItem onClick={() => handleFilterChange('all')} selected={filterStatus === 'all'}>
              <ListItemIcon>
                {filterStatus === 'all' ? 
                  <CheckBoxIcon fontSize="small" sx={{ color: 'white' }} /> : 
                  <CheckBoxOutlineBlankIcon fontSize="small" sx={{ color: 'white' }} />
                }
              </ListItemIcon>
              <ListItemText>Tous</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleFilterChange('active')} selected={filterStatus === 'active'}>
              <ListItemIcon>
                {filterStatus === 'active' ? 
                  <CheckBoxIcon fontSize="small" sx={{ color: 'white' }} /> : 
                  <CheckBoxOutlineBlankIcon fontSize="small" sx={{ color: 'white' }} />
                }
              </ListItemIcon>
              <ListItemText>Actifs</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleFilterChange('alert')} selected={filterStatus === 'alert'}>
              <ListItemIcon>
                {filterStatus === 'alert' ? 
                  <CheckBoxIcon fontSize="small" sx={{ color: 'white' }} /> : 
                  <CheckBoxOutlineBlankIcon fontSize="small" sx={{ color: 'white' }} />
                }
              </ListItemIcon>
              <ListItemText>En alerte</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleFilterChange('inactive')} selected={filterStatus === 'inactive'}>
              <ListItemIcon>
                {filterStatus === 'inactive' ? 
                  <CheckBoxIcon fontSize="small" sx={{ color: 'white' }} /> : 
                  <CheckBoxOutlineBlankIcon fontSize="small" sx={{ color: 'white' }} />
                }
              </ListItemIcon>
              <ListItemText>Inactifs</ListItemText>
            </MenuItem>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
            
            <MenuItem onClick={handleClearFilters}>
              <ListItemIcon>
                <FilterListOffIcon fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText>Effacer les filtres</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Active filters */}
      {(selectedType || filterStatus !== 'all' || selectedRoom) && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center',
          mb: 1.5,
          pb: 1,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="caption" sx={{ mr: 1, opacity: 0.7 }}>
            Filtres actifs:
          </Typography>
          
          {selectedRoom && (
            <FilterChip
              size="small"
              icon={<RoomIcon sx={{ fontSize: '0.8rem !important' }} />}
              label="Salle sélectionnée"
              onDelete={() => {/* This should be handled by parent component */}}
              selected={true}
            />
          )}
          
          {selectedType && (
            <FilterChip
              size="small"
              icon={<CategoryIcon sx={{ fontSize: '0.8rem !important' }} />}
              label={selectedType}
              onDelete={() => onTypeSelect(null)}
              selected={true}
            />
          )}
          
          {filterStatus !== 'all' && (
            <FilterChip
              size="small"
              icon={<FilterListIcon sx={{ fontSize: '0.8rem !important' }} />}
              label={filterStatus === 'alert' ? 'En alerte' : 
                    filterStatus === 'active' ? 'Actifs' : 'Inactifs'}
              onDelete={() => setFilterStatus('all')}
              selected={true}
            />
          )}
          
          <Tooltip title="Effacer tous les filtres">
            <IconButton 
              size="small" 
              onClick={handleClearFilters}
              sx={{ ml: 1, color: 'white', p: 0.5 }}
            >
              <FilterListOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      {/* Object types grid */}
      <Paper sx={{ 
        p: 2, 
        bgcolor: 'rgba(20, 20, 30, 0.7)',
        borderRadius: 2,
        backgroundImage: 'url("/images/pattern-dots.svg")',
        backgroundRepeat: 'repeat',
        backgroundSize: '20px',
        backgroundBlendMode: 'overlay',
      }}>
        <Grid container spacing={1.5}>
          <AnimatePresence>
            {filteredTypes.length > 0 ? (
              filteredTypes.map((typeData, index) => (
                typeData.count > 0 && (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={typeData.type}>
                    <ObjectTypeCard 
                      selected={selectedType === typeData.type}
                      color={typeData.color}
                      onClick={() => handleSelectType(typeData.type)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.03 }
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <IconContainer color={typeData.color}>
                            {getObjectIcon(typeData.type)}
                          </IconContainer>
                          
                          {typeData.status !== 'normal' && (
                            <Tooltip title={typeData.status === 'alert' ? 'En alerte' : 'Attention'}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: typeData.status === 'alert' ? 'error.main' : 'warning.main',
                                boxShadow: typeData.status === 'alert' 
                                  ? '0 0 8px #f44336' 
                                  : '0 0 8px #ff9800'
                              }} />
                            </Tooltip>
                          )}
                        </Box>
                        
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: typeData.color,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {typeData.type}
                          </Typography>
                          
                          <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {typeData.count}
                            </Typography>
                            
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {typeData.activeCount} actif{typeData.activeCount !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </ObjectTypeCard>
                  </Grid>
                )
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ p: 3, textAlign: 'center', opacity: 0.7 }}>
                  <Typography>
                    Aucun type d'objet ne correspond à vos filtres
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={handleClearFilters}
                    sx={{ mt: 1, color: 'white' }}
                  >
                    <FilterListOffIcon />
                  </IconButton>
                </Box>
              </Grid>
            )}
          </AnimatePresence>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EnhancedObjectGrid; 