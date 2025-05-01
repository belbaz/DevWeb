"use client";

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { toast } from 'react-toastify';

const ObjectsPanel = ({ permissions, searchQuery, searchResults }) => {
  const [objects, setObjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentObject, setCurrentObject] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    brand: '',
    room_id: '',
    accessLevel: 'debutant'
  });

  // État pour le filtrage
  const [filteredObjects, setFilteredObjects] = useState([]);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const response = await fetch('/api/objects/getObjects', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch objects');
        }
        
        const data = await response.json();
        setObjects(data.objects || []);
        setFilteredObjects(data.objects || []);
      } catch (error) {
        console.error('Error fetching objects:', error);
        toast.error('Failed to load objects');
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms/getRooms', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        
        const data = await response.json();
        setRooms(data.rooms || []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchObjects();
    fetchRooms();
  }, []);

  // Appliquer le filtre de recherche
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setFilteredObjects(objects);
      return;
    }

    // Filtre basé sur la requête de recherche
    const query = searchQuery.toLowerCase();
    const filtered = objects.filter(obj => 
      obj.type.toLowerCase().includes(query) || 
      (obj.description && obj.description.toLowerCase().includes(query)) ||
      (obj.brand && obj.brand.toLowerCase().includes(query))
    );

    setFilteredObjects(filtered);
  }, [searchQuery, objects]);

  // Filtre basé sur les résultats de recherche
  useEffect(() => {
    if (!searchResults || !searchResults.length) return;

    const objectTypes = searchResults
      .filter(result => result.type === "Objet")
      .map(result => result.name);

    if (objectTypes.length) {
      const filtered = objects.filter(obj => 
        objectTypes.includes(obj.type)
      );
      setFilteredObjects(filtered);
    }
  }, [searchResults, objects]);

  const handleOpenDialog = (object = null) => {
    if (object) {
      setCurrentObject(object);
      setFormData({
        type: object.type || '',
        description: object.description || '',
        brand: object.brand || '',
        room_id: object.room_id?.toString() || '',
        accessLevel: object.accessLevel || 'debutant'
      });
    } else {
      setCurrentObject(null);
      setFormData({
        type: '',
        description: '',
        brand: '',
        room_id: '',
        accessLevel: 'debutant'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = currentObject 
        ? `/api/objects/updateObject?id=${currentObject.id}` 
        : '/api/objects/addObject';
      
      const method = currentObject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${currentObject ? 'update' : 'add'} object`);
      }
      
      toast.success(`Object ${currentObject ? 'updated' : 'added'} successfully`);
      
      // Recharger les objets
      const refreshResponse = await fetch('/api/objects/getObjects', {
        credentials: 'include'
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setObjects(data.objects || []);
        setFilteredObjects(data.objects || []);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error(`Error ${currentObject ? 'updating' : 'adding'} object:`, error);
      toast.error(`Failed to ${currentObject ? 'update' : 'add'} object: ${error.message}`);
    }
  };

  const handleDeleteObject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this object?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/objects/deleteObject?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete object');
      }
      
      toast.success('Object deleted successfully');
      
      // Mettre à jour la liste des objets
      setObjects(objects.filter(obj => obj.id !== id));
      setFilteredObjects(filteredObjects.filter(obj => obj.id !== id));
    } catch (error) {
      console.error('Error deleting object:', error);
      toast.error(`Failed to delete object: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Objects</Typography>
        {permissions.addObject && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Object
          </Button>
        )}
      </Box>

      {filteredObjects.length > 0 ? (
        <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Brand</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Room</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Access Level</TableCell>
                {(permissions.updateObject || permissions.deleteObject) && (
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredObjects.map(object => (
                <TableRow key={object.id}>
                  <TableCell sx={{ color: 'white' }}>{object.type}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{object.description}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{object.brand}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {rooms.find(room => room.id === object.room_id)?.name || '-'}
                  </TableCell>
                  <TableCell sx={{ color: 'white', textTransform: 'capitalize' }}>{object.accessLevel}</TableCell>
                  {(permissions.updateObject || permissions.deleteObject) && (
                    <TableCell>
                      {permissions.updateObject && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(object)}
                          sx={{ color: 'primary.main', mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {permissions.deleteObject && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteObject(object.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', py: 4 }}>
          No objects found.
        </Typography>
      )}

      {/* Dialog for Add/Edit Object */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { 
            bgcolor: 'rgba(30, 30, 30, 0.95)',
            color: 'white',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle>{currentObject ? 'Edit Object' : 'Add New Object'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="type"
            label="Type"
            fullWidth
            variant="filled"
            value={formData.type}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, 
              input: { color: 'white' },
              label: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            variant="filled"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2, 
              textarea: { color: 'white' },
              label: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          />
          <TextField
            margin="dense"
            name="brand"
            label="Brand"
            fullWidth
            variant="filled"
            value={formData.brand}
            onChange={handleInputChange}
            sx={{ mb: 2, 
              input: { color: 'white' },
              label: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          />
          <TextField
            select
            margin="dense"
            name="room_id"
            label="Room"
            fullWidth
            variant="filled"
            value={formData.room_id}
            onChange={handleInputChange}
            sx={{ mb: 2, 
              select: { color: 'white' },
              label: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {rooms.map(room => (
              <MenuItem key={room.id} value={room.id.toString()}>
                {room.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            name="accessLevel"
            label="Access Level"
            fullWidth
            variant="filled"
            value={formData.accessLevel}
            onChange={handleInputChange}
            sx={{ mb: 2, 
              select: { color: 'white' },
              label: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <MenuItem value="debutant">Débutant</MenuItem>
            <MenuItem value="intermediaire">Intermédiaire</MenuItem>
            <MenuItem value="avance">Avancé</MenuItem>
            <MenuItem value="expert">Expert</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentObject ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ObjectsPanel; 