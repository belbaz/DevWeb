"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  Chip,
  IconButton,
  Card,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import SensorsIcon from '@mui/icons-material/Sensors';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SecurityIcon from '@mui/icons-material/Security';
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

// Styled components
const SensorCard = styled(motion.div)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'alert': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'normal': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };
  
  return {
    backgroundColor: 'rgba(30, 30, 40, 0.8)',
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: status ? getStatusColor() : 'rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 15px ${getStatusColor()}30`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      backgroundColor: getStatusColor(),
      boxShadow: `0 0 10px ${getStatusColor()}`,
    }
  };
});

const StatusBadge = styled(Badge)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'alert': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'normal': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };
  
  return {
    '& .MuiBadge-badge': {
      backgroundColor: getStatusColor(),
      boxShadow: `0 0 10px ${getStatusColor()}`,
    }
  };
});

// Get icon for sensor type
const getSensorIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'temperature':
      return <ThermostatIcon />;
    case 'humidity':
      return <WaterDropIcon />;
    case 'light':
      return <WbSunnyIcon />;
    case 'security':
      return <SecurityIcon />;
    case 'power':
      return <ElectricMeterIcon />;
    default:
      return <SensorsIcon />;
  }
};

// Generate mock sensor data for demo purposes
const generateMockSensorData = (rooms) => {
  if (!Array.isArray(rooms)) return [];
  
  const sensorTypes = ['temperature', 'humidity', 'light', 'security', 'power'];
  const sensors = [];
  
  rooms.forEach(room => {
    // Each room gets 1-3 random sensors
    const sensorCount = Math.floor(Math.random() * 3) + 1;
    const roomSensorTypes = [];
    
    // Make sure we don't add duplicate sensor types to a room
    while (roomSensorTypes.length < sensorCount) {
      const randomType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
      if (!roomSensorTypes.includes(randomType)) {
        roomSensorTypes.push(randomType);
      }
    }
    
    roomSensorTypes.forEach(type => {
      // Generate random values appropriate for the sensor type
      let value, min, max, alert_threshold, warning_threshold, status;
      
      switch (type) {
        case 'temperature':
          min = 15;
          max = 25;
          value = Math.round((Math.random() * (max - min) + min) * 10) / 10;
          alert_threshold = 28;
          warning_threshold = 26;
          break;
        case 'humidity':
          min = 40;
          max = 60;
          value = Math.round(Math.random() * (max - min) + min);
          alert_threshold = 70;
          warning_threshold = 65;
          break;
        case 'light':
          min = 300;
          max = 800;
          value = Math.round(Math.random() * (max - min) + min);
          alert_threshold = 1000;
          warning_threshold = 900;
          break;
        case 'security':
          value = Math.random() > 0.9 ? 'BREACH' : 'SECURE';
          alert_threshold = 'BREACH';
          warning_threshold = null;
          break;
        case 'power':
          min = 90;
          max = 240;
          value = Math.round(Math.random() * (max - min) + min);
          alert_threshold = 250;
          warning_threshold = 230;
          break;
        default:
          value = Math.round(Math.random() * 100);
          alert_threshold = 90;
          warning_threshold = 80;
      }
      
      // Determine status based on thresholds
      if (type === 'security') {
        status = value === 'BREACH' ? 'alert' : 'normal';
      } else {
        status = value > alert_threshold ? 'alert' : 
                value > warning_threshold ? 'warning' : 'normal';
      }
      
      // Add random alert for demo purposes (10% chance)
      if (Math.random() < 0.1 && status === 'normal') {
        status = Math.random() < 0.5 ? 'alert' : 'warning';
      }
      
      // Create sensor object
      sensors.push({
        id: `sensor-${room.id}-${type}`,
        room_id: room.id,
        type,
        value,
        unit: getUnitForType(type),
        status,
        alert_threshold,
        warning_threshold,
        last_update: new Date(Date.now() - Math.random() * 3600000).toISOString() // Random time within the last hour
      });
    });
  });
  
  return sensors;
};

// Get unit for sensor type
const getUnitForType = (type) => {
  switch (type?.toLowerCase()) {
    case 'temperature': return '°C';
    case 'humidity': return '%';
    case 'light': return 'lux';
    case 'power': return 'V';
    default: return '';
  }
};

// Format value based on sensor type and unit
const formatSensorValue = (sensor) => {
  if (!sensor) return 'N/A';
  
  if (sensor.type === 'security') {
    return sensor.value;
  }
  
  return `${sensor.value}${sensor.unit || ''}`;
};

// Main component
const SensorStatusPanel = ({ rooms, selectedRoom }) => {
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState([]);
  const [filteredSensors, setFilteredSensors] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Effect to generate mock sensor data initially
  useEffect(() => {
    if (Array.isArray(rooms)) {
      // In a real app, you would fetch real sensor data from your API
      const mockData = generateMockSensorData(rooms);
      setSensorData(mockData);
      setLoading(false);
      setLastUpdate(new Date());
    }
  }, [rooms]);
  
  // Effect to filter sensors when room selection changes
  useEffect(() => {
    if (Array.isArray(sensorData)) {
      const filtered = selectedRoom 
        ? sensorData.filter(sensor => sensor.room_id === selectedRoom)
        : sensorData;
        
      setFilteredSensors(filtered);
    }
  }, [sensorData, selectedRoom]);
  
  // Effect to simulate real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Array.isArray(sensorData) && sensorData.length > 0) {
        // Simulate some sensors updating with new values
        const updatedSensors = [...sensorData];
        const numUpdates = Math.floor(Math.random() * 3) + 1; // 1-3 sensors update
        
        for (let i = 0; i < numUpdates; i++) {
          const randomIndex = Math.floor(Math.random() * updatedSensors.length);
          const sensor = { ...updatedSensors[randomIndex] };
          
          // Update value based on sensor type
          switch (sensor.type) {
            case 'temperature':
              sensor.value = Math.round((sensor.value + (Math.random() * 0.6 - 0.3)) * 10) / 10;
              break;
            case 'humidity':
              sensor.value = Math.round(sensor.value + (Math.random() * 6 - 3));
              break;
            case 'light':
              sensor.value = Math.round(sensor.value + (Math.random() * 100 - 50));
              break;
            case 'security':
              sensor.value = Math.random() > 0.95 ? 'BREACH' : 'SECURE';
              break;
            case 'power':
              sensor.value = Math.round(sensor.value + (Math.random() * 10 - 5));
              break;
            default:
              sensor.value = Math.round(sensor.value + (Math.random() * 10 - 5));
          }
          
          // Update status based on thresholds
          if (sensor.type === 'security') {
            sensor.status = sensor.value === 'BREACH' ? 'alert' : 'normal';
          } else {
            sensor.status = sensor.value > sensor.alert_threshold ? 'alert' : 
                    sensor.value > sensor.warning_threshold ? 'warning' : 'normal';
          }
          
          // Update timestamp
          sensor.last_update = new Date().toISOString();
          
          // Update in the array
          updatedSensors[randomIndex] = sensor;
        }
        
        setSensorData(updatedSensors);
        setLastUpdate(new Date());
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [sensorData]);
  
  const handleRefresh = () => {
    setLoading(true);
    // In a real app, you would fetch fresh data from your API
    setTimeout(() => {
      const mockData = generateMockSensorData(rooms);
      setSensorData(mockData);
      setLoading(false);
      setLastUpdate(new Date());
    }, 500);
  };
  
  // Get the alert count
  const getAlertCount = () => {
    return filteredSensors.filter(sensor => sensor.status === 'alert').length;
  };
  
  // Get the warning count
  const getWarningCount = () => {
    return filteredSensors.filter(sensor => sensor.status === 'warning').length;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }
  
  // Group sensors by room for better organization
  const sensorsByRoom = {};
  
  filteredSensors.forEach(sensor => {
    const roomId = sensor.room_id;
    if (!sensorsByRoom[roomId]) {
      sensorsByRoom[roomId] = [];
    }
    sensorsByRoom[roomId].push(sensor);
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StatusBadge 
            badgeContent={getAlertCount()}
            color="error"
            status="alert"
            sx={{ mr: 2 }}
          >
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <SensorsIcon sx={{ mr: 1 }} /> Sensor Status
            </Typography>
          </StatusBadge>
          
          {getAlertCount() > 0 && (
            <Chip 
              icon={<ErrorIcon />} 
              label={`${getAlertCount()} Alert${getAlertCount() > 1 ? 's' : ''}`}
              color="error"
              size="small"
              sx={{ mr: 1 }}
            />
          )}
          
          {getWarningCount() > 0 && (
            <Chip 
              icon={<WarningIcon />}
              label={`${getWarningCount()} Warning${getWarningCount() > 1 ? 's' : ''}`}
              color="warning"
              size="small"
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mr: 1, opacity: 0.7 }}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </Typography>
          
          <Tooltip title="Refresh sensor data">
            <IconButton onClick={handleRefresh} size="small" sx={{ color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper sx={{ 
        p: 3, 
        bgcolor: 'rgba(20, 20, 30, 0.8)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        backgroundImage: 'radial-gradient(circle at 10% 10%, rgba(40, 40, 60, 0.4) 0%, transparent 70%)',
      }}>
        <AnimatePresence>
          {Object.entries(sensorsByRoom).length > 0 ? (
            Object.entries(sensorsByRoom).map(([roomId, sensors]) => {
              const room = rooms.find(r => r.id === parseInt(roomId));
              const roomName = room?.name || `Room #${roomId}`;
              
              return (
                <Box key={roomId} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                    {roomName}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {sensors.map((sensor) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={sensor.id}>
                        <SensorCard 
                          status={sensor.status}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 1.5 
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getSensorIcon(sensor.type)}
                                <Typography variant="subtitle2" sx={{ ml: 1 }}>
                                  {sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}
                                </Typography>
                              </Box>
                              
                              <Chip 
                                size="small"
                                label={sensor.status.toUpperCase()}
                                color={
                                  sensor.status === 'alert' ? 'error' : 
                                  sensor.status === 'warning' ? 'warning' : 'success'
                                }
                                icon={
                                  sensor.status === 'alert' ? <ErrorIcon /> : 
                                  sensor.status === 'warning' ? <WarningIcon /> : <CheckCircleIcon />
                                }
                              />
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: sensor.status === 'alert' 
                                  ? 'error.main' 
                                  : sensor.status === 'warning' 
                                    ? 'warning.main' 
                                    : 'white' 
                              }}>
                                {formatSensorValue(sensor)}
                              </Typography>
                              
                              {sensor.type !== 'security' && (
                                <Box sx={{ mt: 2 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={
                                      sensor.type === 'temperature' 
                                        ? ((sensor.value - 15) / (30 - 15)) * 100
                                        : sensor.type === 'humidity'
                                          ? (sensor.value / 100) * 100
                                          : sensor.type === 'light'
                                            ? (sensor.value / 1000) * 100
                                            : sensor.type === 'power'
                                              ? ((sensor.value - 90) / (250 - 90)) * 100
                                              : (sensor.value / 100) * 100
                                    }
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: 'rgba(255,255,255,0.1)',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: sensor.status === 'alert' 
                                          ? 'error.main' 
                                          : sensor.status === 'warning' 
                                            ? 'warning.main' 
                                            : 'success.main'
                                      }
                                    }}
                                  />
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    mt: 0.5, 
                                    fontSize: '0.75rem',
                                    opacity: 0.7 
                                  }}>
                                    {sensor.type === 'temperature' && (
                                      <>
                                        <span>15°C</span>
                                        <span>30°C</span>
                                      </>
                                    )}
                                    {sensor.type === 'humidity' && (
                                      <>
                                        <span>0%</span>
                                        <span>100%</span>
                                      </>
                                    )}
                                    {sensor.type === 'light' && (
                                      <>
                                        <span>0 lux</span>
                                        <span>1000 lux</span>
                                      </>
                                    )}
                                    {sensor.type === 'power' && (
                                      <>
                                        <span>90V</span>
                                        <span>250V</span>
                                      </>
                                    )}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                            
                            <Box sx={{ 
                              mt: 1.5, 
                              pt: 1.5, 
                              borderTop: '1px solid rgba(255,255,255,0.1)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {new Date(sensor.last_update).toLocaleTimeString()}
                              </Typography>
                              
                              <Tooltip title="More actions">
                                <IconButton size="small" sx={{ color: 'white' }}>
                                  <MoreHorizIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </SensorCard>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })
          ) : (
            <Box sx={{ 
              textAlign: 'center',
              p: 4,
              opacity: 0.7 
            }}>
              <SensorsIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
              <Typography>
                {selectedRoom ? 'No sensors in selected room' : 'No sensors found'}
              </Typography>
            </Box>
          )}
        </AnimatePresence>
      </Paper>
    </Box>
  );
};

export default SensorStatusPanel; 