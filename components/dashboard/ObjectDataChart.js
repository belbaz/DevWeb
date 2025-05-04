"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { formatDistance } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTooltip,
  Legend,
  Filler
);

// Styled components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 300,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// Generate random data for demo purposes (replace with actual data)
const generateRandomData = (count, min, max) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

const generateRandomDates = (count, startDate) => {
  const dates = [];
  const start = startDate || new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
  
  for (let i = 0; i < count; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

// Main component
const ObjectDataChart = ({ objects, objectData, rooms, selectedRoom, selectedType }) => {
  const [loading, setLoading] = useState(true);
  const [filteredObjects, setFilteredObjects] = useState([]);
  const [openRowId, setOpenRowId] = useState(null);
  const [chartData, setChartData] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  
  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Roboto, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 30, 0.9)',
        titleFont: {
          family: 'Roboto, sans-serif'
        },
        bodyFont: {
          family: 'Roboto, sans-serif'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Roboto, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 30, 0.9)',
        titleFont: {
          family: 'Roboto, sans-serif'
        },
        bodyFont: {
          family: 'Roboto, sans-serif'
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Process objects and generate chart data
  useEffect(() => {
    if (Array.isArray(objects) && Array.isArray(rooms)) {
      setLoading(true);
      
      // Filter objects based on selected room and type
      let filtered = [...objects];
      
      if (selectedRoom) {
        filtered = filtered.filter(obj => obj.room_id === selectedRoom);
      }
      
      if (selectedType) {
        filtered = filtered.filter(obj => obj.brand === selectedType);
      }
      
      // Sort by ID (or any other appropriate field)
      filtered.sort((a, b) => a.id - b.id);
      
      setFilteredObjects(filtered);
      
      // Prepare chart data
      // For demo purposes we'll generate random data
      // In a real app, this would come from your API
      
      // Object counts by room
      const roomCounts = {};
      const roomColors = [];
      
      rooms.forEach((room, index) => {
        const count = objects.filter(obj => obj.room_id === room.id).length;
        if (count > 0) {
          roomCounts[room.name || `Room ${room.id}`] = count;
          // Generate a color with good hue spacing
          const hue = (index * 137) % 360;
          roomColors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
        }
      });
      
      // Object counts by type
      const typeCounts = {};
      const typeColors = [];
      
      objects.forEach(obj => {
        const type = obj.brand || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      // Sort types by count and take the top 10
      const sortedTypes = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      const topTypes = {};
      sortedTypes.forEach(([type, count], index) => {
        topTypes[type] = count;
        // Generate a color with good hue spacing
        const hue = (index * 137) % 360;
        typeColors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
      });
      
      // Activity by day (random data for now)
      const dates = generateRandomDates(14);
      const activityData = generateRandomData(14, 1, 20);
      
      // Prepare the chart data structure
      const chartDataObj = {
        roomDistribution: {
          labels: Object.keys(roomCounts),
          datasets: [
            {
              label: 'Objects per Room',
              data: Object.values(roomCounts),
              backgroundColor: roomColors,
              borderColor: roomColors.map(color => color.replace('0.8', '1')),
              borderWidth: 1,
            },
          ],
        },
        typeDistribution: {
          labels: Object.keys(topTypes),
          datasets: [
            {
              label: 'Objects by Type',
              data: Object.values(topTypes),
              backgroundColor: typeColors,
              borderColor: typeColors.map(color => color.replace('0.8', '1')),
              borderWidth: 1,
            },
          ],
        },
        activityTimeline: {
          labels: dates,
          datasets: [
            {
              label: 'Activity',
              data: activityData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
      };
      
      setChartData(chartDataObj);
      setLoading(false);
    }
  }, [objects, rooms, selectedRoom, selectedType]);
  
  const handleRowClick = (id) => {
    setOpenRowId(openRowId === id ? null : id);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const getObjectTypeCounts = () => {
    const counts = {};
    
    filteredObjects.forEach(obj => {
      const type = obj.brand || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    return counts;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 3, 
        bgcolor: 'rgba(20, 20, 30, 0.8)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        mb: 4
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <DataThresholdingIcon sx={{ mr: 1 }} />
          Object Analytics {selectedRoom && ' - ' + (rooms.find(r => r.id === selectedRoom)?.name || `Room #${selectedRoom}`)}
          {selectedType && ' - ' + selectedType}
        </Typography>
        
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {filteredObjects.length} objects
        </Typography>
      </Box>
      
      {/* Chart Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<PieChartIcon />} 
            label="Room Distribution" 
            iconPosition="start" 
          />
          <Tab 
            icon={<BarChartIcon />} 
            label="Type Distribution" 
            iconPosition="start" 
          />
          <Tab 
            icon={<ShowChartIcon />} 
            label="Activity Timeline" 
            iconPosition="start" 
          />
          <Tab 
            icon={<TableChartIcon />} 
            label="Data Table" 
            iconPosition="start" 
          />
        </Tabs>
      </Box>
      
      {/* Chart Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 0 && (
            <ChartContainer>
              <Pie 
                data={chartData.roomDistribution} 
                options={pieOptions} 
              />
            </ChartContainer>
          )}
          
          {activeTab === 1 && (
            <ChartContainer>
              <Bar 
                data={chartData.typeDistribution} 
                options={lineOptions} 
              />
            </ChartContainer>
          )}
          
          {activeTab === 2 && (
            <ChartContainer>
              <Line 
                data={chartData.activityTimeline} 
                options={lineOptions} 
              />
            </ChartContainer>
          )}
          
          {activeTab === 3 && (
            <TableContainer component={Box} sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'rgba(20, 20, 30, 0.9)', color: 'white' }}></TableCell>
                    <TableCell sx={{ bgcolor: 'rgba(20, 20, 30, 0.9)', color: 'white' }}>ID</TableCell>
                    <TableCell sx={{ bgcolor: 'rgba(20, 20, 30, 0.9)', color: 'white' }}>Type</TableCell>
                    <TableCell sx={{ bgcolor: 'rgba(20, 20, 30, 0.9)', color: 'white' }}>Room</TableCell>
                    <TableCell sx={{ bgcolor: 'rgba(20, 20, 30, 0.9)', color: 'white' }}>Access Level</TableCell>
                    <TableCell sx={{ bgcolor: 'rgba(20, 20, 30, 0.9)', color: 'white' }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredObjects.map((obj) => (
                    <>
                      <StyledTableRow key={obj.id}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleRowClick(obj.id)}
                            sx={{ color: 'white' }}
                          >
                            {openRowId === obj.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>{obj.id}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{obj.brand || 'Unknown'}</TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          {rooms.find(r => r.id === obj.room_id)?.name || `Room #${obj.room_id}`}
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>{obj.accessLevel || 'N/A'}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{obj.description || 'No description'}</TableCell>
                      </StyledTableRow>
                      
                      {/* Expanded Row with Details */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={openRowId === obj.id} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 2 }}>
                              <Typography variant="subtitle2" gutterBottom component="div">
                                Object Details
                              </Typography>
                              <Table size="small">
                                <TableBody>
                                  {Object.entries(obj).map(([key, value]) => (
                                    key !== 'id' && key !== 'brand' && key !== 'room_id' && 
                                    key !== 'accessLevel' && key !== 'description' && (
                                      <TableRow key={key}>
                                        <TableCell component="th" scope="row" sx={{ color: 'white', opacity: 0.7 }}>
                                          {key}
                                        </TableCell>
                                        <TableCell sx={{ color: 'white' }}>
                                          {value !== null && typeof value !== 'undefined' ? String(value) : 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                  
                  {filteredObjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: 'white', opacity: 0.7 }}>
                        No objects found matching the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </motion.div>
      </AnimatePresence>
    </Paper>
  );
};

export default ObjectDataChart; 