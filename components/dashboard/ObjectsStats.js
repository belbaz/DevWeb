"use client";

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, CircularProgress, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { toast } from 'react-toastify';

const ObjectsStats = ({ permissions }) => {
  const [objects, setObjects] = useState([]);
  const [objectData, setObjectData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalObjects: 0,
    byType: {},
    byRoom: {},
    byAccessLevel: {
      debutant: 0,
      intermediaire: 0,
      avance: 0,
      expert: 0
    }
  });

  // Mapping des niveaux en anglais
  const levelMap = {
    'debutant': 'Beginner',
    'intermediaire': 'Intermediate',
    'avance': 'Advanced',
    'expert': 'Expert'
  };

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

        // Calculer les statistiques
        calculateStats(fetchedObjects);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = (objects) => {
    const newStats = {
      totalObjects: Array.isArray(objects) ? objects.length : 0,
      byType: {},
      byRoom: {},
      byAccessLevel: {
        debutant: 0,
        intermediaire: 0,
        avance: 0,
        expert: 0
      }
    };

    // Compter les objets par type
    if (Array.isArray(objects)) {
      objects.forEach(obj => {
        if (!obj) return;
        
        // Par type
        if (obj.type) {
          newStats.byType[obj.type] = (newStats.byType[obj.type] || 0) + 1;
        }
        
        // Par salle
        if (obj.room_id) {
          const roomId = String(obj.room_id);
          newStats.byRoom[roomId] = (newStats.byRoom[roomId] || 0) + 1;
        } else {
          newStats.byRoom['unassigned'] = (newStats.byRoom['unassigned'] || 0) + 1;
        }
        
        // Par niveau d'accès
        if (obj.accessLevel) {
          newStats.byAccessLevel[obj.accessLevel] = (newStats.byAccessLevel[obj.accessLevel] || 0) + 1;
        }
      });
    }

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
          label: type
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

  // Safely prepare chart data for access levels
  const prepareAccessLevelChartData = () => {
    try {
      if (!stats || !stats.byAccessLevel) {
        return { data: [], labels: [] };
      }
      
      const accessLevels = Object.keys(stats.byAccessLevel);
      const counts = Object.values(stats.byAccessLevel);
      
      if (accessLevels.length === 0 || counts.some(isNaN)) {
        return { data: [], labels: [] };
      }
      
      return {
        data: counts,
        labels: accessLevels.map(level => levelMap[level] || level.charAt(0).toUpperCase() + level.slice(1))
      };
    } catch (error) {
      console.error('Error preparing access level chart data:', error);
      return { data: [], labels: [] };
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

  // Count instances by type
  const countObjectDataByType = () => {
    try {
      const counts = {};
      if (!objectData || !Array.isArray(objectData) || objectData.length === 0) return {};
      
      objectData.forEach(obj => {
        if (obj && obj.type_Object) {
          counts[obj.type_Object] = (counts[obj.type_Object] || 0) + 1;
        }
      });
      return counts;
    } catch (error) {
      console.error('Error counting object data by type:', error);
      return {};
    }
  };

  // Safe preparation of pie chart data
  const prepareObjectDataChartData = () => {
    try {
      const typeData = countObjectDataByType();
      if (!typeData || Object.keys(typeData).length === 0) return [];
      
      const chartData = Object.entries(typeData)
        .map(([type, count], index) => ({
          id: index,
          value: count,
          label: type
        }))
        .filter(item => item && item.value > 0); // Ensure no zero values
      
      return chartData;
    } catch (error) {
      console.error('Error preparing object data chart:', error);
      return [];
    }
  };

  // Safe rendering helper functions
  const canRenderPieChart = (data) => {
    return Array.isArray(data) && data.length > 0 && 
           data.every(item => item && typeof item.value === 'number' && item.value > 0);
  };
  
  const canRenderBarChart = (data, labels) => {
    return Array.isArray(data) && data.length > 0 && 
           Array.isArray(labels) && labels.length > 0 &&
           data.length === labels.length &&
           data.every(value => typeof value === 'number');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  const objectTypeChartData = prepareTypeChartData();
  const { data: accessLevelData, labels: accessLevelLabels } = prepareAccessLevelChartData();
  const objectDataChartData = prepareObjectDataChartData();
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Objects Dashboard</Typography>
      
      {/* Résumé en chiffres */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" align="center">{stats.totalObjects}</Typography>
              <Typography variant="body2" align="center">Total Objects</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" align="center">{Object.keys(stats.byType || {}).length}</Typography>
              <Typography variant="body2" align="center">Object Types</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" align="center">{Array.isArray(rooms) ? rooms.length : 0}</Typography>
              <Typography variant="body2" align="center">Rooms</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" align="center">{Array.isArray(objectData) ? objectData.length : 0}</Typography>
              <Typography variant="body2" align="center">Active Instances</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3}>
        {/* Distribution par type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Distribution by Type</Typography>
            {canRenderPieChart(objectTypeChartData) ? (
              <Box sx={{ height: 300, position: 'relative' }}>
                <PieChart
                  series={[{ 
                    data: objectTypeChartData, 
                    innerRadius: 30, 
                    paddingAngle: 2, 
                    cornerRadius: 4
                  }]}
                  height={300}
                  margin={{ right: 120 }}
                  sx={{
                    '--ChartsLegend-rootSpacing': '10px',
                    '--ChartsLegend-itemWidth': '120px',
                    '--ChartsLegend-itemMarkSize': '8px',
                    '--ChartsLegend-labelColor': 'white',
                    '--ChartsLegend-labelFontSize': '12px',
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography align="center">No data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Distribution par niveau d'accès */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Distribution by Access Level</Typography>
            {canRenderBarChart(accessLevelData, accessLevelLabels) ? (
              <Box sx={{ height: 300, position: 'relative' }}>
                <BarChart
                  series={[{ 
                    data: accessLevelData,
                    label: 'Objects',
                    valueFormatter: (value) => `${value}`
                  }]}
                  xAxis={[{ 
                    data: accessLevelLabels,
                    scaleType: 'band',
                    tickLabelStyle: { fill: 'white' }
                  }]}
                  yAxis={[{ 
                    tickLabelStyle: { fill: 'white' },
                    valueFormatter: (value) => `${value}`
                  }]}
                  height={300}
                  sx={{
                    '.MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { fill: 'white' },
                    '.MuiChartsAxis-left .MuiChartsAxis-tickLabel': { fill: 'white' },
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography align="center">No data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Liste des types */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Main Object Types</Typography>
        <Grid container spacing={2}>
          {Object.entries(stats.byType || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([type, count], index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Box sx={{ 
                  p: 1, 
                  borderLeft: '3px solid', 
                  borderColor: `hsl(${index * 30}, 70%, 50%)`,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}>
                  <Typography variant="body2" noWrap>{type}</Typography>
                  <Typography variant="h6">{count}</Typography>
                </Box>
              </Grid>
            ))}
        </Grid>
      </Paper>

      {/* NEW SECTION: Object Instances */}
      {Array.isArray(objectData) && objectData.length > 0 && (
        <Paper sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Active Object Instances</Typography>
          
          {/* Pie chart of object instances by type */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <Typography variant="body2" gutterBottom>Distribution by Type</Typography>
                {canRenderPieChart(objectDataChartData) ? (
                  <Box sx={{ position: 'relative', height: 250 }}>
                    <PieChart
                      series={[{
                        data: objectDataChartData,
                        innerRadius: 30,
                        paddingAngle: 2,
                        cornerRadius: 4
                      }]}
                      height={250}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                    <Typography align="center">No data available</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>Instances by Type</Typography>
              <TableContainer sx={{ maxHeight: 250 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Type</TableCell>
                      <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }} align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(countObjectDataByType())
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count], index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
                          <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{type}</TableCell>
                          <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }} align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
          
          {/* Table of recent object instances */}
          <Typography variant="body2" gutterBottom>Recent Object Data</Typography>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Last Updated</TableCell>
                  <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {objectData
                  .filter(obj => obj && obj.id) // Ensure valid objects
                  .sort((a, b) => {
                    try {
                      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
                    } catch (e) {
                      return 0;
                    }
                  })
                  .slice(0, 10)
                  .map((obj) => (
                    <TableRow key={obj.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{obj.id}</TableCell>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{obj.type_Object || 'Unknown'}</TableCell>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        {obj.updated_at ? new Date(obj.updated_at).toLocaleString() : 'Unknown'}
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <Tooltip title={formatObjectData(obj)} arrow placement="top">
                          <Box sx={{ 
                            maxWidth: 300, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {formatObjectData(obj)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ObjectsStats; 