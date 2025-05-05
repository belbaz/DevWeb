"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper,
  Card, 
  CardContent, 
  CircularProgress, 
  useMediaQuery,
  useTheme 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';

// Styled components
const StatsCard = styled(Paper)(({ theme, color }) => ({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: 0,
  height: '100%',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
  backgroundColor: color || 'rgba(50, 50, 70, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.2s ease',
  position: 'relative',
  minHeight: '120px',
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(1),
  borderRadius: 0,
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(50, 50, 70, 0.4)',
  marginBottom: theme.spacing(2),
  minHeight: '300px',
}));

const PieChartWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '250px',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    height: '200px',
  },
}));

// Custom donut chart component
const DonutChart = ({ data, size = 180, thickness = 30, title = '' }) => {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = radius - thickness;

  return (
    <Box sx={{ textAlign: 'center', position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${centerX}, ${centerY})`}>
          {data.map((item, index) => {
            // Calculs pour l'arc de cercle
            const angle = (item.value / total) * 360;
            const endAngle = startAngle + angle;
            
            // Convertir les angles en radians
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            // Coordonnées des points
            const outerStartX = radius * Math.cos(startRad);
            const outerStartY = radius * Math.sin(startRad);
            const outerEndX = radius * Math.cos(endRad);
            const outerEndY = radius * Math.sin(endRad);
            
            const innerStartX = innerRadius * Math.cos(startRad);
            const innerStartY = innerRadius * Math.sin(startRad);
            const innerEndX = innerRadius * Math.cos(endRad);
            const innerEndY = innerRadius * Math.sin(endRad);
            
            // Flag pour l'arc (1 si angle > 180 degrés)
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            // Path pour l'arc
            const path = [
              `M ${outerStartX} ${outerStartY}`, // Point de départ extérieur
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`, // Arc extérieur
              `L ${innerEndX} ${innerEndY}`, // Ligne vers le point de fin intérieur
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`, // Arc intérieur (dans l'autre sens)
              'Z' // Fermer le chemin
            ].join(' ');
            
            // Mettre à jour l'angle de départ pour le prochain segment
            startAngle = endAngle;
            
            return (
              <path
                key={index}
                d={path}
                fill={item.color}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1"
              />
            );
          })}
          <circle cx="0" cy="0" r={innerRadius - 2} fill="rgba(20, 20, 30, 0.8)" />
        </g>
      </svg>
      {title && (
        <Typography 
          variant="body2" 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '0.85rem',
            textAlign: 'center',
            maxWidth: innerRadius * 1.5,
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>
      )}
    </Box>
  );
};

// Custom legend component
const ChartLegend = ({ data }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'center', 
      gap: 1, 
      mt: 2,
      maxWidth: '100%',
    }}>
      {data.map((item, index) => (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            px: 1,
            py: 0.5,
            bgcolor: 'rgba(0,0,0,0.25)',
            borderRadius: 1,
            maxWidth: 'calc(50% - 8px)',
            flexGrow: 1,
            flexBasis: '120px',
          }}
        >
          <Box sx={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%', 
            bgcolor: item.color,
            flexShrink: 0
          }} />
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'white',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.7rem',
            }}
          >
            {item.label} ({item.value})
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

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
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load objects
        const objectsResponse = await fetch('/api/objects/getObjects', {
          credentials: 'include'
        });
        
        if (!objectsResponse.ok) {
          throw new Error('Failed to fetch objects');
        }
        
        const objectsData = await objectsResponse.json();
        const fetchedObjects = objectsData.objects || [];
        setObjects(fetchedObjects);
        
        // Load object data instances
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
        
        // Load rooms
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
        .slice(0, 10); // Limiter à 10 types pour la lisibilité
      
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
  const hasData = (data) => {
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

  const roomData = prepareObjectDataChartData();
  const statusData = countObjectDataByType();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Section des statistiques */}
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
            S
          </Box>
          Objects Statistics
        </Typography>
      </Box>

      {/* Layout principal - responsive avec flexbox */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        gap: { xs: 1.5, sm: 2 },
        mb: { xs: 1.5, sm: 2 }
      }}>
        {/* Partie gauche - 4 cartes (2x2) */}
        <Box sx={{ 
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.5, sm: 2 }
        }}>
          {/* Ligne 1 */}
          <Box sx={{ 
            display: 'flex',
            width: '100%', 
            gap: { xs: 1.5, sm: 2 }
          }}>
            {/* Total Objects */}
            <Box sx={{ width: '50%' }}>
              <StatsCard color="rgba(33, 150, 243, 0.15)" sx={{ 
                height: '100%',
                minHeight: { xs: '100px', sm: '120px' }
              }}>
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    opacity: 0.9, 
                    fontSize: { xs: '0.75rem', sm: '0.85rem' }
                  }}>
                    Total Objects
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    my: { xs: 0.5, sm: 1 }, 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}>
                    {stats.totalObjects}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'white', 
                    opacity: 0.7,
                    fontSize: { xs: '0.65rem', sm: '0.7rem' }
                  }}>
                    All objects
                  </Typography>
                </Box>
              </StatsCard>
            </Box>
            
            {/* Active Objects */}
            <Box sx={{ width: '50%' }}>
              <StatsCard color="rgba(76, 175, 80, 0.15)" sx={{ 
                height: '100%',
                minHeight: { xs: '100px', sm: '120px' }
              }}>
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    opacity: 0.9, 
                    fontSize: { xs: '0.75rem', sm: '0.85rem' }
                  }}>
                    Active Objects
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    my: { xs: 0.5, sm: 1 }, 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}>
                    {getActiveObjectsCount()}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'white', 
                    opacity: 0.7,
                    fontSize: { xs: '0.65rem', sm: '0.7rem' }
                  }}>
                    {stats.totalObjects > 0 ? 
                      `${((getActiveObjectsCount() / stats.totalObjects) * 100).toFixed(0)}% of total` : 
                      'No data available'}
                  </Typography>
                </Box>
              </StatsCard>
            </Box>
          </Box>
          
          {/* Ligne 2 */}
          <Box sx={{ 
            display: 'flex',
            width: '100%', 
            gap: { xs: 1.5, sm: 2 }
          }}>
            {/* Object Types */}
            <Box sx={{ width: '50%' }}>
              <StatsCard color="rgba(255, 152, 0, 0.15)" sx={{ 
                height: '100%',
                minHeight: { xs: '100px', sm: '120px' }
              }}>
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    opacity: 0.9, 
                    fontSize: { xs: '0.75rem', sm: '0.85rem' }
                  }}>
                    Object Types
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    my: { xs: 0.5, sm: 1 }, 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}>
                    {Object.keys(stats.byType).length}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'white', 
                    opacity: 0.7,
                    fontSize: { xs: '0.65rem', sm: '0.7rem' }
                  }}>
                    Unique types
                  </Typography>
                </Box>
              </StatsCard>
            </Box>
            
            {/* Rooms with Objects */}
            <Box sx={{ width: '50%' }}>
              <StatsCard color="rgba(156, 39, 176, 0.15)" sx={{ 
                height: '100%',
                minHeight: { xs: '100px', sm: '120px' }
              }}>
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    opacity: 0.9, 
                    fontSize: { xs: '0.75rem', sm: '0.85rem' }
                  }}>
                    Rooms with Objects
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    my: { xs: 0.5, sm: 1 }, 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}>
                    {Object.keys(stats.byRoom).length}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'white', 
                    opacity: 0.7,
                    fontSize: { xs: '0.65rem', sm: '0.7rem' }
                  }}>
                    With at least 1 object
                  </Typography>
                </Box>
              </StatsCard>
            </Box>
          </Box>
        </Box>
        
        {/* Partie droite - Graphique Object Status */}
        <Box sx={{ 
          width: { xs: '100%', md: '50%' },
          mt: { xs: 1, md: 0 }
        }}>
          <ChartContainer sx={{ 
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: '250px', sm: '280px', md: '100%' }
          }}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: 0 }}>
              <Typography variant="body2" sx={{ 
                color: 'white', 
                fontWeight: 500,
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }}>
                Object Status
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: { xs: 1, sm: 2 }, 
              pt: { xs: 0.5, sm: 1 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1
            }}>
              {hasData(statusData) ? (
                <>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1,
                    pt: { xs: 1, sm: 2 }
                  }}>
                    <DonutChart 
                      data={statusData} 
                      size={isMobile ? 140 : 180} 
                      thickness={isMobile ? 25 : 40}
                    />
                  </Box>
                  <ChartLegend data={statusData} />
                </>
              ) : (
                <Typography sx={{ color: 'white', opacity: 0.7 }}>
                  No data to display
                </Typography>
              )}
            </Box>
          </ChartContainer>
        </Box>
      </Box>

      {/* Graphique Rooms en dessous, seul */}
      <Box sx={{ width: '100%' }}>
        <ChartContainer sx={{ 
          width: '100%',
          minHeight: { xs: '250px', sm: '280px' }
        }}>
          <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: 0 }}>
            <Typography variant="body2" sx={{ 
              color: 'white', 
              fontWeight: 500,
              fontSize: { xs: '0.8rem', sm: '0.9rem' }
            }}>
              Objects by Room
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: { xs: 1, sm: 2 }, 
            pt: { xs: 0.5, sm: 1 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {hasData(roomData) ? (
              <>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pt: { xs: 1, sm: 2 }
                }}>
                  <DonutChart 
                    data={roomData} 
                    size={isMobile ? 140 : 180} 
                    thickness={isMobile ? 25 : 40}
                  />
                </Box>
                <ChartLegend data={roomData} />
              </>
            ) : (
              <Typography sx={{ color: 'white', opacity: 0.7 }}>
                No data to display
              </Typography>
            )}
          </Box>
        </ChartContainer>
      </Box>
    </Box>
  );
};

export default ObjectsStats; 