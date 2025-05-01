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
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { toast } from 'react-toastify';

const HistoryPanel = ({ permissions, searchQuery, searchResults }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [objectTypes, setObjectTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // État pour le filtrage
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/objectDataHistory/getAllHistory', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        
        const data = await response.json();
        setHistory(data.history || []);
        setFilteredHistory(data.history || []);
        
        // Extraire les types d'objets uniques de l'historique
        const types = [...new Set(data.history.map(entry => entry.type_Object))];
        setObjectTypes(types);
      } catch (error) {
        console.error('Error fetching history:', error);
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filtre basé sur le type d'objet sélectionné
  useEffect(() => {
    if (!selectedType) {
      setFilteredHistory(history);
      return;
    }

    const filtered = history.filter(entry => entry.type_Object === selectedType);
    setFilteredHistory(filtered);
  }, [selectedType, history]);

  // Appliquer le filtre de recherche
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      if (selectedType) {
        const filtered = history.filter(entry => entry.type_Object === selectedType);
        setFilteredHistory(filtered);
      } else {
        setFilteredHistory(history);
      }
      return;
    }

    // Filtre basé sur la requête de recherche
    const query = searchQuery.toLowerCase();
    let filtered = history.filter(entry => {
      // Vérifier si le type d'objet correspond
      const typeMatches = entry.type_Object && entry.type_Object.toLowerCase().includes(query);
      
      // Vérifier si l'ID de l'objet correspond
      const idMatches = entry.object_data_id && entry.object_data_id.toString().includes(query);
      
      // Vérifier si une valeur dans les données JSON correspond
      let dataMatches = false;
      try {
        const jsonData = typeof entry.old_data === 'object' ? entry.old_data : JSON.parse(entry.old_data);
        dataMatches = Object.values(jsonData).some(value => 
          String(value).toLowerCase().includes(query)
        );
      } catch (e) {
        // Ignorer les erreurs JSON
      }
      
      return typeMatches || idMatches || dataMatches;
    });

    // Appliquer également le filtre par type si actif
    if (selectedType) {
      filtered = filtered.filter(entry => entry.type_Object === selectedType);
    }

    setFilteredHistory(filtered);
  }, [searchQuery, history, selectedType]);

  // Filtre basé sur les résultats de recherche
  useEffect(() => {
    if (!searchResults || !searchResults.length) return;

    // Filtrer par objets dans les résultats de recherche
    const objectTypes = searchResults
      .filter(result => result.type === "Objet")
      .map(result => result.name);

    if (objectTypes.length) {
      const filtered = history.filter(entry => 
        objectTypes.includes(entry.type_Object)
      );
      setFilteredHistory(filtered);
    }
  }, [searchResults, history]);

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
    setDetailOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
        <Typography variant="h6">History</Typography>
        <FormControl 
          variant="filled" 
          sx={{ minWidth: 200, 
            '& .MuiFilledInput-root': { 
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
              '&.Mui-focused': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
          }}
        >
          <InputLabel id="object-type-select-label">Filter by Type</InputLabel>
          <Select
            labelId="object-type-select-label"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            label="Filter by Type"
          >
            <MenuItem value="">All Types</MenuItem>
            {objectTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredHistory.length > 0 ? (
        <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 30, 0.95)', color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 30, 0.95)', color: 'white', fontWeight: 'bold' }}>Object Type</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 30, 0.95)', color: 'white', fontWeight: 'bold' }}>Data ID</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 30, 0.95)', color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell sx={{ color: 'white' }}>
                    {formatDate(entry.updated_at)}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {entry.type_Object}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {entry.object_data_id}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(entry)}
                        sx={{ color: 'info.main' }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', py: 4 }}>
          No history records found.
        </Typography>
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            bgcolor: 'rgba(30, 30, 30, 0.95)',
            color: 'white'
          }
        }}
      >
        <DialogTitle>History Details</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Box>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'auto 1fr', 
                gap: '12px 24px',
                mb: 3,
                '& > :nth-of-type(odd)': { 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 'bold'
                }
              }}>
                <Typography>Date:</Typography>
                <Typography>{formatDate(selectedEntry.updated_at)}</Typography>
                
                <Typography>Object Type:</Typography>
                <Typography>{selectedEntry.type_Object}</Typography>
                
                <Typography>Data ID:</Typography>
                <Typography>{selectedEntry.object_data_id}</Typography>
              </Box>
              
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Previous Data:
              </Typography>
              
              <Paper sx={{ 
                p: 2, 
                bgcolor: 'rgba(0, 0, 0, 0.6)', 
                maxHeight: '400px', 
                overflow: 'auto' 
              }}>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'monospace', 
                  fontSize: '0.9rem',
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  {(() => {
                    try {
                      const jsonData = typeof selectedEntry.old_data === 'object' 
                        ? selectedEntry.old_data 
                        : JSON.parse(selectedEntry.old_data);
                      return JSON.stringify(jsonData, null, 2);
                    } catch (e) {
                      return 'Invalid JSON data';
                    }
                  })()}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryPanel; 