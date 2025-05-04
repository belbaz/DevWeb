"use client";

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, CircularProgress, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { toast } from 'react-toastify';

const ObjectsStats = ({ permissions, selectedRoom, selectedType }) => {
  const [objects, setObjects] = useState([]);
  const [objectData, setObjectData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalObjects: 0,
    byType: {},
    byRoom: {}
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Fonction pour gérer le redimensionnement de la fenêtre
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les objets
        const objectsResponse = await fetch('/api/objects/getObjects', {
          credentials: 'include'
        });
        
        if (!objectsResponse.ok) {
          throw new Error('Failed to fetch objects');
        }
        
        const objectsData = await objectsResponse.json();
        const fetchedObjects = objectsData.objects || [];
        setObjects(fetchedObjects);
        
        // Charger les données d'objets réels
        try {
          const objectDataResponse = await fetch('/api/objectData/listAllDatas', {
            credentials: 'include'
          });
          
          if (objectDataResponse.ok) {
            const data = await objectDataResponse.json();
            setObjectData(Array.isArray(data.objectData) ? data.objectData : []);
          } else {
            console.log('Failed to load object data');
            setObjectData([]);
          }
        } catch (error) {
          console.log('Error fetching object data');
          setObjectData([]);
        }
        
        // Charger les salles
        const roomsResponse = await fetch('/api/rooms/getRooms', {
          credentials: 'include'
        });
        
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          setRooms(roomsData.rooms || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Recalculate stats when filters or data change
  useEffect(() => {
    calculateStats(objects);
  }, [objects, selectedRoom, selectedType]);

  const calculateStats = (allObjects) => {
    if (!Array.isArray(allObjects)) {
      setStats({
        totalObjects: 0,
        byType: {},
        byRoom: {}
      });
      return;
    }

    // Filter objects based on selections
    let filteredObjects = [...allObjects];
    
    if (selectedRoom) {
      filteredObjects = filteredObjects.filter(obj => obj.room_id === selectedRoom);
    }
    
    if (selectedType) {
      filteredObjects = filteredObjects.filter(obj => obj.type === selectedType);
    }

    const newStats = {
      totalObjects: filteredObjects.length,
      byType: {},
      byRoom: {}
    };

    // Count objects by type and room
    filteredObjects.forEach(obj => {
      if (!obj) return;
      
      // By type
      if (obj.type) {
        newStats.byType[obj.type] = (newStats.byType[obj.type] || 0) + 1;
      }
      
      // By room
      if (obj.room_id) {
        const roomId = String(obj.room_id);
        newStats.byRoom[roomId] = (newStats.byRoom[roomId] || 0) + 1;
      } else {
        newStats.byRoom['unassigned'] = (newStats.byRoom['unassigned'] || 0) + 1;
      }
    });

    setStats(newStats);
  };

  // Safely prepare chart data for object types
  const prepareTypeChartData = () => {
    try {
      if (!stats || !stats.byType || Object.keys(stats.byType).length === 0) {
        return [];
      }
      
      const data = Object.entries(stats.byType)
        .map(([type, count], index) => ({
          id: index,
          value: count,
          label: type,
          color: `hsl(${(index * 137) % 360}, 80%, 65%)`
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Limiter à 8 types pour la lisibilité
      
      return data.length > 0 ? data : [];
    } catch (error) {
      console.error('Error preparing type chart data:', error);
      return [];
    }
  };

  const formatRoomName = (roomId) => {
    if (roomId === 'unassigned') return 'Unassigned';
    if (!Array.isArray(rooms)) return `Room #${roomId}`;
    
    const room = rooms.find(r => r && r.id && r.id.toString() === roomId);
    return room && room.name ? room.name : `Room #${roomId}`;
  };

  // Format data properties for display
  const formatObjectData = (obj) => {
    if (!obj || !obj.data) return 'No data';
    
    try {
      let data;
      
      if (typeof obj.data === 'string') {
        try {
          data = JSON.parse(obj.data);
        } catch (e) {
          // If can't parse as JSON, return as is
          return obj.data.substring(0, 100);
        }
      } else {
        data = obj.data;
      }
      
      if (!data || typeof data !== 'object') {
        return 'Invalid data format';
      }
      
      // Return a formatted string of key-value pairs
      return Object.entries(data)
        .map(([key, value]) => {
          // Safely convert value to string
          let stringValue = '';
          try {
            stringValue = typeof value === 'object' 
              ? JSON.stringify(value).substring(0, 50) 
              : String(value).substring(0, 50);
          } catch (e) {
            stringValue = '[Complex Value]';
          }
          return `${key}: ${stringValue}`;
        })
        .join(' | ');
    } catch (e) {
      console.error('Error formatting object data:', e);
      return 'Error displaying data';
    }
  };

  // Count active/inactive objects and prepare data for pie chart
  const countObjectDataByType = () => {
    if (!Array.isArray(objectData) || objectData.length === 0) {
      return [{ id: 0, value: 1, label: 'No Data', color: 'hsl(0, 0%, 60%)' }];
    }
    
    // Determine which objects to count based on current filters
    let filteredObjectIds = [];
    let filteredObjects = [...objects];
    
    if (selectedRoom) {
      filteredObjects = filteredObjects.filter(obj => obj.room_id === selectedRoom);
    }
    
    if (selectedType) {
      filteredObjects = filteredObjects.filter(obj => obj.type === selectedType);
    }
    
    filteredObjectIds = filteredObjects.map(obj => obj.id);
    
    // Now count how many have data and their active status
    const objectsWithData = objectData.filter(data => filteredObjectIds.includes(data.id));
    
    // If no objects have data, show objects count vs. available data
    if (objectsWithData.length === 0) {
      return [
        { id: 0, value: filteredObjects.length, label: 'No Data', color: 'hsl(0, 0%, 60%)' },
      ];
    }
    
    let activeCount = 0;
    let inactiveCount = 0;
    let unknownCount = 0;
    
    objectsWithData.forEach(data => {
      if (!data.data) {
        unknownCount++;
        return;
      }
      
      // Try to determine if the object is active
      let dataObject;
      try {
        dataObject = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      } catch (e) {
        unknownCount++;
        return;
      }
      
      // Check various fields that might indicate active status
      const stateValue = 
        dataObject.État || 
        dataObject.Etat || 
        dataObject.Status || 
        dataObject.Statut;
        
      const modeValue = dataObject.Mode;
      
      // Determine if the device is active based on its state value
      if (stateValue === 'On' || 
          stateValue === 'Actif' || 
          stateValue === 'OK' || 
          stateValue === 'Allumé' ||
          stateValue === 'En marche' || 
          stateValue === 'En déplacement' ||
          modeValue === 'Auto') {
        activeCount++;
      } else if (stateValue === 'Off' || 
                stateValue === 'Inactif' || 
                stateValue === 'Veille') {
        inactiveCount++;
      } else {
        unknownCount++;
      }
    });
    
    // Calculate objects without data
    const noDataCount = filteredObjects.length - objectsWithData.length;
    
    // Prepare chart data
    const chartData = [];
    
    // Only include categories with values
    if (activeCount > 0) {
      chartData.push({ id: 0, value: activeCount, label: 'Active', color: 'hsl(120, 80%, 60%)' });
    }
    
    if (inactiveCount > 0) {
      chartData.push({ id: chartData.length, value: inactiveCount, label: 'Inactive', color: 'hsl(0, 80%, 60%)' });
    }
    
    if (unknownCount > 0) {
      chartData.push({ id: chartData.length, value: unknownCount, label: 'Unknown Status', color: 'hsl(45, 80%, 60%)' });
    }
    
    if (noDataCount > 0) {
      chartData.push({ id: chartData.length, value: noDataCount, label: 'No Data', color: 'hsl(0, 0%, 60%)' });
    }
    
    return chartData.length > 0 ? chartData : [{ id: 0, value: 1, label: 'No Data', color: 'hsl(0, 0%, 60%)' }];
  };

  // Get active objects count
  const getActiveObjectsCount = () => {
    const activeData = countObjectDataByType().find(item => item.label === 'Active');
    return activeData ? activeData.value : 0;
  };

  // Prepare data for Room pie chart
  const prepareObjectDataChartData = () => {
    try {
      if (!stats || !stats.byRoom || Object.keys(stats.byRoom).length === 0) {
        return [];
      }
      
      const data = Object.entries(stats.byRoom)
        .map(([roomId, count], index) => ({
          id: index,
          value: count,
          label: formatRoomName(roomId),
          color: `hsl(${(index * 137) % 360}, 80%, 65%)`
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Limiter à 8 salles pour la lisibilité
      
      return data.length > 0 ? data : [];
    } catch (error) {
      console.error('Error preparing room chart data:', error);
      return [];
    }
  };

  // Safe rendering helper functions
  const canRenderPieChart = (data) => {
    return Array.isArray(data) && data.length > 0 && 
           data.every(item => item && typeof item.value === 'number' && item.value > 0);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 2, 
        width: '100%', // Make sure it takes full width
        maxWidth: '100%',
        boxSizing: 'border-box', // Ensure padding is included in width calculation
      }}
    >
      {/* Show simple stat cards in the first responsive row */}
      <Grid container spacing={2} mb={isMobile ? 2 : 3}>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: 'rgba(33, 150, 243, 0.15)', 
            borderRadius: 0,
            backdropFilter: 'blur(5px)',
            '-webkit-backdrop-filter': 'blur(5px)',
          }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                Total Objects
              </Typography>
              <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold', color: 'white' }}>
                {stats.totalObjects}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                {selectedRoom || selectedType ? 'Filtered view' : 'All objects'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: 'rgba(76, 175, 80, 0.15)', 
            borderRadius: 0,
            backdropFilter: 'blur(5px)',
            '-webkit-backdrop-filter': 'blur(5px)',
          }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                Active Objects
              </Typography>
              <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold', color: 'white' }}>
                {getActiveObjectsCount()}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                {stats.totalObjects > 0 ? 
                  `${((getActiveObjectsCount() / stats.totalObjects) * 100).toFixed(0)}% of total` : 
                  'No data available'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: 'rgba(255, 152, 0, 0.15)', 
            borderRadius: 0,
            backdropFilter: 'blur(5px)',
            '-webkit-backdrop-filter': 'blur(5px)',
          }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                Object Types
              </Typography>
              <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold', color: 'white' }}>
                {Object.keys(stats.byType).length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                Unique types 
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: 'rgba(156, 39, 176, 0.15)', 
            borderRadius: 0,
            backdropFilter: 'blur(5px)',
            '-webkit-backdrop-filter': 'blur(5px)',
          }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                Rooms with Objects
              </Typography>
              <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold', color: 'white' }}>
                {Object.keys(stats.byRoom).length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                With at least 1 object
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart section */}
      <Grid container spacing={2} sx={{ height: isMobile ? 'auto' : 'calc(100% - 115px)', mt: 0 }}>
        <Grid item xs={12} md={6} sx={{ height: isMobile ? '300px' : '100%' }}>
          <Box sx={{ 
            height: '100%', 
            p: { xs: 0, sm: 1 }, 
            bgcolor: 'rgba(50, 50, 70, 0.4)', 
            borderRadius: 0,
            backdropFilter: 'blur(5px)',
            '-webkit-backdrop-filter': 'blur(5px)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%', // Ensure full width
          }}>
            <Typography variant="body2" sx={{ mb: 0.5, px: 1, pt: 1, color: 'white' }}>
              Objects by Room
            </Typography>
            <Box sx={{ flexGrow: 1, width: '100%', height: 'calc(100% - 24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {canRenderPieChart(prepareObjectDataChartData()) ? (
                <PieChart
                  series={[
                    {
                      data: prepareObjectDataChartData(),
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, color: 'gray' },
                      innerRadius: 0,
                      paddingAngle: 1,
                      cornerRadius: 0,
                      startAngle: -90,
                      endAngle: 270
                    },
                  ]}
                  height={isMobile ? 250 : windowSize.height * 0.28}
                  width="100%" // Use full width
                  margin={{ top: 10, bottom: 10, left: 0, right: isMobile ? 0 : 110 }}
                  legend={{ 
                    position: isMobile ? 'bottom' : 'right',
                    itemMarkWidth: 10,
                    itemMarkHeight: 10,
                    markGap: 5,
                    itemGap: 5,
                    labelStyle: {
                      fontSize: 11,
                      fill: 'white',
                    },
                  }}
                  colors={prepareObjectDataChartData().map(item => item.color)}
                  slotProps={{
                    legend: {
                      labelStyle: {
                        fill: 'white',
                      },
                    },
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography sx={{ color: 'white', opacity: 0.7 }}>No data to display</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: isMobile ? '300px' : '100%' }}>
          <Box sx={{ 
            height: '100%', 
            p: { xs: 0, sm: 1 }, 
            bgcolor: 'rgba(50, 50, 70, 0.4)', 
            borderRadius: 0,
            backdropFilter: 'blur(5px)',
            '-webkit-backdrop-filter': 'blur(5px)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%', // Ensure full width
          }}>
            <Typography variant="body2" sx={{ mb: 0.5, px: 1, pt: 1, color: 'white' }}>
              Object Status
            </Typography>
            <Box sx={{ flexGrow: 1, width: '100%', height: 'calc(100% - 24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {canRenderPieChart(countObjectDataByType()) ? (
                <PieChart
                  series={[
                    {
                      data: countObjectDataByType(),
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, color: 'gray' },
                      innerRadius: 0,
                      paddingAngle: 1,
                      cornerRadius: 0,
                      startAngle: -90,
                      endAngle: 270,
                    },
                  ]}
                  height={isMobile ? 250 : windowSize.height * 0.28}
                  width="100%" // Use full width
                  margin={{ top: 10, bottom: 10, left: 0, right: isMobile ? 0 : 110 }}
                  legend={{ 
                    position: isMobile ? 'bottom' : 'right',
                    itemMarkWidth: 10,
                    itemMarkHeight: 10,
                    markGap: 5,
                    itemGap: 5,
                    labelStyle: {
                      fontSize: 11,
                      fill: 'white',
                    },
                  }}
                  colors={countObjectDataByType().map(item => item.color)}
                  slotProps={{
                    legend: {
                      labelStyle: {
                        fill: 'white',
                      },
                    },
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography sx={{ color: 'white', opacity: 0.7 }}>No data to display</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ObjectsStats; 