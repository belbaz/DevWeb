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
import HistoryIcon from '@mui/icons-material/History';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { toast } from 'react-toastify';

const DataPanel = ({ permissions, searchQuery, searchResults }) => {
  const [objectTypes, setObjectTypes] = useState([]);
  const [objData, setObjData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type_Object: '',
    data: '{}'
  });

  // État pour le filtrage
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchObjectTypes = async () => {
      try {
        const response = await fetch('/api/objects/getObjects', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch object types');
        }
        
        const data = await response.json();
        setObjectTypes(data.objects || []);
      } catch (error) {
        console.error('Error fetching object types:', error);
        toast.error('Failed to load object types');
      }
    };

    const fetchData = async () => {
      try {
        const response = await fetch('/api/objectData/listAllDatas', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setObjData(data.objectData || []);
        setFilteredData(data.objectData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchObjectTypes();
    fetchData();
  }, []);

  // Filtre basé sur le type d'objet sélectionné
  useEffect(() => {
    if (!selectedType) {
      setFilteredData(objData);
      return;
    }

    const filtered = objData.filter(data => data.type_Object === selectedType);
    setFilteredData(filtered);
  }, [selectedType, objData]);

  // Appliquer le filtre de recherche
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      // Si un type est sélectionné, respecter ce filtre
      if (selectedType) {
        const filtered = objData.filter(data => data.type_Object === selectedType);
        setFilteredData(filtered);
      } else {
        setFilteredData(objData);
      }
      return;
    }

    // Filtre basé sur la requête de recherche
    const query = searchQuery.toLowerCase();
    const filtered = objData.filter(data => {
      // Vérifier si le type d'objet correspond
      const typeMatches = data.type_Object.toLowerCase().includes(query);
      
      // Vérifier si une valeur dans les données JSON correspond
      let dataMatches = false;
      try {
        const jsonData = typeof data.data === 'object' ? data.data : JSON.parse(data.data);
        dataMatches = Object.values(jsonData).some(value => 
          String(value).toLowerCase().includes(query)
        );
      } catch (e) {
        // Ignorer les erreurs JSON
      }
      
      return typeMatches || dataMatches;
    });

    // Appliquer également le filtre par type si actif
    if (selectedType) {
      setFilteredData(filtered.filter(data => data.type_Object === selectedType));
    } else {
      setFilteredData(filtered);
    }
  }, [searchQuery, objData, selectedType]);

  // Filtre basé sur les résultats de recherche
  useEffect(() => {
    if (!searchResults || !searchResults.length) return;

    // Filtrer par objets dans les résultats de recherche
    const objectTypes = searchResults
      .filter(result => result.type === "Objet")
      .map(result => result.name);

    if (objectTypes.length) {
      const filtered = objData.filter(data => 
        objectTypes.includes(data.type_Object)
      );
      setFilteredData(filtered);
    }
  }, [searchResults, objData]);

  const handleOpenDialog = (data = null) => {
    if (data) {
      setCurrentData(data);
      setFormData({
        type_Object: data.type_Object || '',
        data: typeof data.data === 'object' ? JSON.stringify(data.data, null, 2) : data.data
      });
    } else {
      setCurrentData(null);
      setFormData({
        type_Object: selectedType || '',
        data: '{}'
      });
    }
    setJsonError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setJsonError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Valider le JSON lorsque l'utilisateur modifie le champ data
    if (name === 'data') {
      try {
        JSON.parse(value);
        setJsonError('');
      } catch (error) {
        setJsonError('Invalid JSON format');
      }
    }
  };

  const handleSubmit = async () => {
    // Valider le JSON avant de soumettre
    try {
      JSON.parse(formData.data);
    } catch (error) {
      setJsonError('Invalid JSON format. Please fix before submitting.');
      return;
    }

    try {
      const url = currentData 
        ? `/api/objectData/updateData?id=${currentData.id}` 
        : '/api/objectData/addData';
      
      const method = currentData ? 'PUT' : 'POST';
      
      // Préparer les données à envoyer
      const dataToSend = {
        ...formData,
        data: JSON.parse(formData.data) // S'assurer que data est un objet JSON
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${currentData ? 'update' : 'add'} data`);
      }
      
      toast.success(`Data ${currentData ? 'updated' : 'added'} successfully`);
      
      // Recharger les données
      const refreshResponse = await fetch('/api/objectData/listAllDatas', {
        credentials: 'include'
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setObjData(data.objectData || []);
        
        // Appliquer à nouveau le filtre si un type est sélectionné
        if (selectedType) {
          setFilteredData(data.objectData.filter(d => d.type_Object === selectedType) || []);
        } else {
          setFilteredData(data.objectData || []);
        }
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error(`Error ${currentData ? 'updating' : 'adding'} data:`, error);
      toast.error(`Failed to ${currentData ? 'update' : 'add'} data: ${error.message}`);
    }
  };

  const handleDeleteData = async (id) => {
    if (!window.confirm('Are you sure you want to delete this data?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/objectData/deleteData?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete data');
      }
      
      toast.success('Data deleted successfully');
      
      // Mettre à jour la liste des données
      setObjData(objData.filter(d => d.id !== id));
      setFilteredData(filteredData.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error(`Failed to delete data: ${error.message}`);
    }
  };

  const handleViewHistory = async (id) => {
    setHistoryLoading(true);
    setOpenHistoryDialog(true);
    
    try {
      const response = await fetch(`/api/objectDataHistory/getHistoryByInstanceId?object_data_id=${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await response.json();
      setHistoryData(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString) => {
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
        <Typography variant="h6">Object Data</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl 
            variant="filled" 
            sx={{ minWidth: 180, 
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
                <MenuItem key={type.type} value={type.type}>
                  {type.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {permissions.addData && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Data
            </Button>
          )}
        </Box>
      </Box>

      {filteredData.length > 0 ? (
        <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Object Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Updated</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map(data => {
                // Formater les données JSON pour l'affichage
                let dataDisplay = '{}';
                try {
                  const jsonObj = typeof data.data === 'object' ? data.data : JSON.parse(data.data);
                  dataDisplay = JSON.stringify(jsonObj).substring(0, 50) + (JSON.stringify(jsonObj).length > 50 ? '...' : '');
                } catch (e) {
                  dataDisplay = 'Invalid JSON';
                }
                
                return (
                  <TableRow key={data.id}>
                    <TableCell sx={{ color: 'white' }}>{data.id}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{data.type_Object}</TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Tooltip title="Click to view full data" arrow>
                        <Typography 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => {
                            toast.info(
                              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflow: 'auto' }}>
                                {JSON.stringify(data.data, null, 2)}
                              </pre>,
                              { autoClose: false, closeOnClick: false }
                            );
                          }}
                        >
                          {dataDisplay}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      {data.updated_at ? formatDate(data.updated_at) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View History">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewHistory(data.id)}
                          sx={{ color: 'info.main', mr: 1 }}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {permissions.updateData && (
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(data)}
                            sx={{ color: 'primary.main', mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {permissions.deleteData && (
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteData(data.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', py: 4 }}>
          No data found.
        </Typography>
      )}

      {/* Dialog for Add/Edit Data */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { 
            bgcolor: 'rgba(30, 30, 30, 0.95)',
            color: 'white',
            minWidth: '500px'
          }
        }}
      >
        <DialogTitle>{currentData ? 'Edit Data' : 'Add New Data'}</DialogTitle>
        <DialogContent>
          <FormControl 
            fullWidth 
            variant="filled" 
            sx={{ mb: 2 }}
          >
            <InputLabel id="data-type-select-label">Object Type</InputLabel>
            <Select
              labelId="data-type-select-label"
              name="type_Object"
              value={formData.type_Object}
              onChange={handleInputChange}
              required
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                '&.Mui-focused': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              {objectTypes.map(type => (
                <MenuItem key={type.type} value={type.type}>
                  {type.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            name="data"
            label="Data (JSON)"
            fullWidth
            variant="filled"
            value={formData.data}
            onChange={handleInputChange}
            multiline
            rows={10}
            error={!!jsonError}
            helperText={jsonError}
            sx={{ mb: 2, 
              textarea: { color: 'white', fontFamily: 'monospace' },
              label: { color: 'rgba(255, 255, 255, 0.7)' },
              '.MuiFormHelperText-root': { color: 'error.main' }
            }}
            InputProps={{
              sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!!jsonError}
          >
            {currentData ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog 
        open={openHistoryDialog} 
        onClose={() => setOpenHistoryDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            bgcolor: 'rgba(30, 30, 30, 0.95)',
            color: 'white'
          }
        }}
      >
        <DialogTitle>Data History</DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : historyData.length > 0 ? (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)', color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)', color: 'white', fontWeight: 'bold' }}>Previous Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyData.map((entry) => {
                    let dataDisplay = '{}';
                    try {
                      const jsonObj = typeof entry.old_data === 'object' ? entry.old_data : JSON.parse(entry.old_data);
                      dataDisplay = JSON.stringify(jsonObj, null, 2);
                    } catch (e) {
                      dataDisplay = 'Invalid JSON';
                    }
                    
                    return (
                      <TableRow key={entry.id}>
                        <TableCell sx={{ color: 'white' }}>
                          {entry.updated_at ? formatDate(entry.updated_at) : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          <pre style={{ 
                            whiteSpace: 'pre-wrap', 
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            margin: 0
                          }}>
                            {dataDisplay}
                          </pre>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', py: 4 }}>
              No history available for this data.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataPanel; 