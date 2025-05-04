"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const ObjectTypeGrid = ({ objects, selectedRoom, onTypeSelect, selectedType }) => {
  const [objectTypes, setObjectTypes] = useState([]);
  
  useEffect(() => {
    if (Array.isArray(objects)) {
      // Filter objects by selected room if needed
      const filteredObjects = selectedRoom 
        ? objects.filter(obj => obj && obj.room_id === selectedRoom)
        : objects;
      
      // Group objects by type and count them
      const typeMap = {};
      
      filteredObjects.forEach(obj => {
        if (obj && obj.type) {
          if (!typeMap[obj.type]) {
            typeMap[obj.type] = {
              count: 0,
              name: obj.type,
              color: getRandomColor(obj.type)
            };
          }
          typeMap[obj.type].count++;
        }
      });
      
      // Convert to array and sort by count (descending)
      const typesArray = Object.values(typeMap)
        .sort((a, b) => b.count - a.count);
      
      setObjectTypes(typesArray);
    }
  }, [objects, selectedRoom]);

  // Generate consistent colors for each type
  const getRandomColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 45%)`;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Object Types {selectedRoom ? 'in Selected Room' : 'in Museum'}
      </Typography>
      
      <Grid container spacing={2}>
        {objectTypes.map((type, index) => (
          <Grid item xs={4} sm={3} md={2} key={index}>
            <Paper 
              sx={{ 
                p: 2,
                bgcolor: selectedType === type.name 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderTop: '4px solid',
                borderColor: type.color,
                opacity: type.count > 0 ? 1 : 0.5
              }}
              onClick={() => {
                if (type.count > 0) {
                  onTypeSelect(type.name === selectedType ? null : type.name);
                }
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                {type.count}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  wordBreak: 'break-word',
                  maxHeight: '3em',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {type.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
        
        {objectTypes.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ 
              p: 4, 
              bgcolor: 'rgba(0, 0, 0, 0.3)', 
              textAlign: 'center',
              borderRadius: 1
            }}>
              <Typography>
                {selectedRoom 
                  ? 'No objects in this room' 
                  : 'No objects found in the museum'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ObjectTypeGrid; 