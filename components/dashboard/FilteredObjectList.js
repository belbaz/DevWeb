"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const FilteredObjectList = ({ 
  objects, 
  objectData, 
  rooms, 
  selectedRoom, 
  selectedType, 
  onClearRoom, 
  onClearType 
}) => {
  const [filteredObjects, setFilteredObjects] = useState([]);
  const [activeInstances, setActiveInstances] = useState([]);
  
  // Filter objects based on selected room and type
  useEffect(() => {
    if (Array.isArray(objects)) {
      let filtered = [...objects];
      
      // Apply room filter
      if (selectedRoom) {
        filtered = filtered.filter(obj => obj && obj.room_id === selectedRoom);
      }
      
      // Apply type filter
      if (selectedType) {
        filtered = filtered.filter(obj => obj && obj.type === selectedType);
      }
      
      setFilteredObjects(filtered);
    }
  }, [objects, selectedRoom, selectedType]);
  
  // Filter active instances based on filtered objects
  useEffect(() => {
    if (Array.isArray(objectData) && Array.isArray(filteredObjects)) {
      const objectIds = filteredObjects.map(obj => obj.id);
      const filtered = objectData.filter(
        instance => instance && objectIds.includes(instance.object_id)
      );
      setActiveInstances(filtered);
    }
  }, [objectData, filteredObjects]);
  
  // Format room name
  const formatRoomName = (roomId) => {
    if (roomId === 'unassigned') return 'Unassigned';
    if (!Array.isArray(rooms)) return `Room #${roomId}`;
    
    const room = rooms.find(r => r && r.id && r.id.toString() === roomId);
    return room && room.name ? room.name : `Room #${roomId}`;
  };
  
  // Format data for display
  const formatObjectData = (data) => {
    if (!data) return 'No data';
    
    try {
      let parsed;
      
      if (typeof data === 'string') {
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          return data.substring(0, 50) + (data.length > 50 ? '...' : '');
        }
      } else {
        parsed = data;
      }
      
      if (!parsed || typeof parsed !== 'object') {
        return 'Invalid data format';
      }
      
      return Object.entries(parsed)
        .map(([key, value]) => {
          let displayValue = '';
          try {
            displayValue = typeof value === 'object' 
              ? JSON.stringify(value).substring(0, 30) 
              : String(value).substring(0, 30);
          } catch (e) {
            displayValue = '[Complex Value]';
          }
          return `${key}: ${displayValue}${displayValue.length > 30 ? '...' : ''}`;
        })
        .join(' | ');
    } catch (e) {
      return 'Error displaying data';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h6">
          Filtered Objects {filteredObjects.length > 0 && `(${filteredObjects.length})`}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectedRoom && (
            <Chip 
              label={`Room: ${formatRoomName(selectedRoom)}`}
              color="primary"
              onDelete={onClearRoom}
              deleteIcon={<ClearIcon />}
            />
          )}
          
          {selectedType && (
            <Chip 
              label={`Type: ${selectedType}`}
              color="secondary"
              onDelete={onClearType}
              deleteIcon={<ClearIcon />}
            />
          )}
        </Box>
      </Box>
      
      {filteredObjects.length > 0 ? (
        <Grid container spacing={3}>
          {/* Objects table */}
          <Grid item xs={12}>
            <Paper sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white', mb: 3 }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Type</TableCell>
                      <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Room</TableCell>
                      <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Description</TableCell>
                      <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Brand</TableCell>
                      <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Access Level</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredObjects.map(obj => (
                      <TableRow 
                        key={obj.id} 
                        sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                      >
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {obj.id}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {obj.type || 'Unknown'}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {formatRoomName(obj.room_id)}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <Tooltip title={obj.description || 'No description'} arrow placement="top">
                            <Typography sx={{ 
                              maxWidth: 150, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {obj.description || 'No description'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {obj.brand || 'Unknown'}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {obj.accessLevel || 'Standard'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          {/* Active instances table */}
          {activeInstances.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Active Instances ({activeInstances.length})
              </Typography>
              <Paper sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>ID</TableCell>
                        <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Type</TableCell>
                        <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Last Updated</TableCell>
                        <TableCell sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.8)' }}>Data</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeInstances
                        .sort((a, b) => {
                          try {
                            return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
                          } catch (e) {
                            return 0;
                          }
                        })
                        .map(instance => (
                          <TableRow 
                            key={instance.id} 
                            sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                          >
                            <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              {instance.id}
                            </TableCell>
                            <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              {instance.type_Object || 'Unknown'}
                            </TableCell>
                            <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              {instance.updated_at ? new Date(instance.updated_at).toLocaleString() : 'Unknown'}
                            </TableCell>
                            <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <Tooltip title={formatObjectData(instance.data)} arrow placement="top">
                                <Typography sx={{ 
                                  maxWidth: 300, 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap' 
                                }}>
                                  {formatObjectData(instance.data)}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        <Box sx={{ p: 4, bgcolor: 'rgba(0, 0, 0, 0.3)', textAlign: 'center', borderRadius: 1 }}>
          <Typography>
            {selectedRoom || selectedType 
              ? 'No objects match the selected filters' 
              : 'Select a room or object type to see objects'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FilteredObjectList; 