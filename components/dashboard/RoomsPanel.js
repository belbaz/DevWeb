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

const RoomsPanel = ({ permissions, searchQuery, searchResults }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    floor: 0,
    levelAcces: 'beginner',
    roomtype: ''
  });

  // État pour le filtrage
  const [filteredRooms, setFilteredRooms] = useState([]);

  useEffect(() => {
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
        setFilteredRooms(data.rooms || []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Appliquer le filtre de recherche
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setFilteredRooms(rooms);
      return;
    }

    // Filtre basé sur la requête de recherche
    const query = searchQuery.toLowerCase();
    const filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(query) ||
      (room.roomtype && room.roomtype.toLowerCase().includes(query)) ||
      (room.floor && room.floor.toString().includes(query))
    );

    setFilteredRooms(filtered);
  }, [searchQuery, rooms]);

  // Filtre basé sur les résultats de recherche
  useEffect(() => {
    if (!searchResults || !searchResults.length) return;

    const roomNames = searchResults
      .filter(result => result.type === "Pièce")
      .map(result => result.name);

    if (roomNames.length) {
      const filtered = rooms.filter(room =>
        roomNames.includes(room.name)
      );
      setFilteredRooms(filtered);
    }
  }, [searchResults, rooms]);

  const handleOpenDialog = (room = null) => {
    if (room) {
      setCurrentRoom(room);
      setFormData({
        name: room.name || '',
        floor: room.floor || 0,
        levelAcces: room.levelAcces || 'beginner',
        roomtype: room.roomtype || ''
      });
    } else {
      setCurrentRoom(null);
      setFormData({
        name: '',
        floor: 0,
        levelAcces: 'beginner',
        roomtype: ''
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
      [name]: name === 'floor' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = currentRoom
        ? `/api/rooms/updateRoom?id=${currentRoom.id}`
        : '/api/rooms/addRoom';

      const method = currentRoom ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to ${currentRoom ? 'update' : 'add'} room`);
      }

      toast.success(`Room ${currentRoom ? 'updated' : 'added'} successfully`);

      // Recharger les salles
      const refreshResponse = await fetch('/api/rooms/getRooms', {
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setRooms(data.rooms || []);
        setFilteredRooms(data.rooms || []);
      }

      handleCloseDialog();
    } catch (error) {
      console.error(`Error ${currentRoom ? 'updating' : 'adding'} room:`, error);
      toast.error(`Failed to ${currentRoom ? 'update' : 'add'} room: ${error.message}`);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/deleteRoom?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete room');
      }

      toast.success('Room deleted successfully');

      // Mettre à jour la liste des salles
      setRooms(rooms.filter(room => room.id !== id));
      setFilteredRooms(filteredRooms.filter(room => room.id !== id));
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(`Failed to delete room: ${error.message}`);
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
        <Typography variant="h6">Rooms</Typography>
        {permissions.addRoom && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Room
          </Button>
        )}
      </Box>

      {filteredRooms.length > 0 ? (
        <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Floor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Access Level</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRooms.map(room => (
                <TableRow key={room.id}>
                  <TableCell sx={{ color: 'white' }}>{room.name}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{room.floor}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{room.roomtype}</TableCell>
                  <TableCell sx={{ color: 'white', textTransform: 'capitalize' }}>{room.levelAcces}</TableCell>
                  <TableCell>
                    {permissions.updateRoom && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(room)}
                        sx={{ color: 'primary.main', mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {permissions.deleteRoom && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRoom(room.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', py: 4 }}>
          No rooms found.
        </Typography>
      )}

      {/* Dialog for Add/Edit Room */}
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
        <DialogTitle>{currentRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Room Name"
            fullWidth
            variant="filled"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{
              mb: 2,
              input: { color: 'white' },
              label: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          />
          <TextField
            margin="dense"
            name="floor"
            label="Floor"
            type="number"
            fullWidth
            variant="filled"
            value={formData.floor}
            onChange={handleInputChange}
            sx={{
              mb: 2,
              input: { color: 'white' },
              label: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          />
          <TextField
            margin="dense"
            name="roomtype"
            label="Room Type"
            fullWidth
            variant="filled"
            value={formData.roomtype}
            onChange={handleInputChange}
            sx={{
              mb: 2,
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
            name="levelAcces"
            label="Access Level"
            fullWidth
            variant="filled"
            value={formData.levelAcces}
            onChange={handleInputChange}
            sx={{
              mb: 2,
              select: { color: 'white' },
              label: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <MenuItem value="beginner">beginner</MenuItem>
            <MenuItem value="intermediate">intermediate</MenuItem>
            <MenuItem value="advanced">advanced</MenuItem>
            <MenuItem value="expert">Expert</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentRoom ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomsPanel; 