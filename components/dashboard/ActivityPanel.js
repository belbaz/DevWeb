"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Button,
  Tooltip,
  Avatar,
  Badge,
  Tab,
  Tabs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import UpdateIcon from '@mui/icons-material/Update';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SensorsIcon from '@mui/icons-material/Sensors';
import MuseumIcon from '@mui/icons-material/Museum';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';

// Styled components
const ActivityItem = styled(motion.div)(({ theme, eventType = 'default' }) => {
  // Colors for different event types
  const getEventColor = () => {
    switch (eventType) {
      case 'login': return theme.palette.primary.main;
      case 'update': return theme.palette.info.main;
      case 'alert': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'expo': return theme.palette.secondary.main;
      default: return theme.palette.grey[500];
    }
  };

  return {
    backgroundColor: 'rgba(30, 30, 40, 0.8)',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.5),
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    borderLeft: `3px solid ${getEventColor()}`,
    '&:hover': {
      backgroundColor: 'rgba(40, 40, 50, 0.9)',
      transform: 'translateX(2px)',
    }
  };
});

const TimeChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  color: theme.palette.grey[400],
  fontSize: '0.65rem',
  height: '20px',
  '& .MuiChip-label': {
    padding: '0 8px',
  }
}));

const ActivityBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    boxShadow: `0 0 10px ${theme.palette.error.main}`,
  }
}));

// Get icon for activity type
const getActivityIcon = (type) => {
  switch (type) {
    case 'login':
      return <LoginIcon color="primary" />;
    case 'expoVisit':
      return <MuseumIcon sx={{ color: '#9c27b0' }} />;
    case 'objectUpdate':
      return <UpdateIcon sx={{ color: '#2196f3' }} />;
    case 'roomChange':
      return <CategoryIcon sx={{ color: '#ff9800' }} />;
    case 'sensorAlert':
      return <SensorsIcon sx={{ color: '#f44336' }} />;
    case 'booking':
      return <EventIcon sx={{ color: '#4caf50' }} />;
    default:
      return <HistoryIcon sx={{ color: '#9e9e9e' }} />;
  }
};

// Format date to relative time
const formatTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: fr
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Date inconnue";
  }
};

// Get message for history action
const getActionMessage = (action) => {
  if (!action) return "Action inconnue";
  
  const { type, pseudo, currentLevel, date } = action;
  
  switch (type) {
    case 'login':
      return `${pseudo} s'est connecté(e)`;
    case 'expoVisit':
      return `${pseudo} a visité une exposition`;
    case 'objectUpdate':
      return `${pseudo} a mis à jour un objet`;
    default:
      return `${pseudo} a effectué une action: ${type}`;
  }
};

// Get message for object data history
const getObjectUpdateMessage = (history, objects) => {
  if (!history) return "Mise à jour inconnue";
  
  const { object_data_id, old_data, updatedBy } = history;
  
  // Find the object type
  const objectType = object_data_id && objects 
    ? objects.find(o => o.id === object_data_id)?.type || "Objet inconnu"
    : "Objet";
  
  const changedFields = Object.keys(old_data || {}).length;
  
  return `Mise à jour d'un ${objectType} (${changedFields} champ${changedFields > 1 ? 's' : ''} modifié${changedFields > 1 ? 's' : ''})`;
};

const ActivityPanel = ({ historyActions, objectDataHistory, objects, objectData, rooms }) => {
  const [loading, setLoading] = useState(true);
  const [activityItems, setActivityItems] = useState([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [activityTab, setActivityTab] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  
  // Process history data
  useEffect(() => {
    if (Array.isArray(historyActions) && Array.isArray(objectDataHistory)) {
      // Combine different types of history
      const allActivities = [];
      
      // Process history actions
      historyActions.forEach(action => {
        allActivities.push({
          id: `action-${action.id}`,
          type: action.type,
          timestamp: action.date,
          user: action.pseudo,
          level: action.currentLevel,
          eventType: action.type === 'login' ? 'login' : 
                    action.type === 'expoVisit' ? 'expo' : 'update',
          message: getActionMessage(action),
          sourceType: 'action'
        });
      });
      
      // Process object data history
      objectDataHistory.forEach(history => {
        const relatedObject = objects?.find(o => o.id === history.object_data_id);
        
        allActivities.push({
          id: `object-${history.id}`,
          type: 'objectUpdate',
          timestamp: history.updated_at,
          user: history.updatedBy?.toString() || 'Système',
          objectId: history.object_data_id,
          roomId: relatedObject?.room_id,
          oldData: history.old_data,
          eventType: 'update',
          message: getObjectUpdateMessage(history, objects),
          sourceType: 'objectUpdate',
          objectType: relatedObject?.type
        });
      });
      
      // Generate some sensor alerts based on object data
      if (Array.isArray(objectData)) {
        objectData.forEach(data => {
          if (!data.data) return;
          
          // Check for abnormal conditions
          if (data.data.Alerte === 'Oui' || 
              data.data.État === 'Alerte' || 
              data.data.Humidité > '70%' || 
              data.data.Température > '28°C' ||
              (data.data.Batterie && parseInt(data.data.Batterie) < 15)) {
            
            const relatedObject = objects?.find(o => o.id === data.id);
            const roomName = relatedObject?.room_id && rooms 
              ? rooms.find(r => r.id === relatedObject.room_id)?.name || `Salle #${relatedObject.room_id}`
              : "Salle inconnue";
              
            let alertMessage = "";
            if (data.data.Alerte === 'Oui') alertMessage = "Alerte détectée";
            else if (data.data.Humidité > '70%') alertMessage = `Humidité élevée (${data.data.Humidité})`;
            else if (data.data.Température > '28°C') alertMessage = `Température élevée (${data.data.Température})`;
            else if (data.data.Batterie && parseInt(data.data.Batterie) < 15) alertMessage = `Batterie faible (${data.data.Batterie})`;
            else alertMessage = "Condition anormale détectée";
            
            // Add some randomization to alert timestamps
            const randomOffset = Math.floor(Math.random() * 86400000); // Random milliseconds within 24h
            const alertTimestamp = new Date(Date.now() - randomOffset).toISOString();
            
            allActivities.push({
              id: `alert-${data.id}-${Date.now()}`,
              type: 'sensorAlert',
              timestamp: alertTimestamp,
              objectId: data.id,
              roomId: relatedObject?.room_id,
              roomName,
              eventType: 'alert',
              message: `${alertMessage} dans ${roomName}`,
              sourceType: 'alert',
              objectType: relatedObject?.type || data.type_Object,
              alertDetails: data.data
            });
          }
        });
      }
      
      // Sort by timestamp, newest first
      allActivities.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      // Count alerts
      const alertsCount = allActivities.filter(item => item.eventType === 'alert').length;
      setAlertCount(alertsCount);
      
      setActivityItems(allActivities);
      setLoading(false);
    }
  }, [historyActions, objectDataHistory, objects, objectData, rooms]);
  
  const handleTabChange = (event, newValue) => {
    setActivityTab(newValue);
  };
  
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 10);
  };
  
  // Filter items based on selected tab
  const getFilteredItems = () => {
    if (activityTab === 0) return activityItems;
    if (activityTab === 1) return activityItems.filter(item => item.eventType === 'alert' || item.eventType === 'warning');
    if (activityTab === 2) return activityItems.filter(item => item.sourceType === 'objectUpdate');
    if (activityTab === 3) return activityItems.filter(item => item.type === 'login' || item.type === 'expoVisit');
    
    return activityItems;
  };
  
  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1.5
      }}>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontSize: '1rem' 
        }}>
          <HistoryIcon sx={{ mr: 1 }} /> Activité Récente
        </Typography>
        
        <Button 
          size="small" 
          startIcon={<RefreshIcon />}
          variant="text"
          color="inherit"
          sx={{ opacity: 0.7 }}
          onClick={() => {/* This would refresh the data */}}
        >
          Actualiser
        </Button>
      </Box>
      
      {/* Activity filter tabs */}
      <Tabs 
        value={activityTab} 
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="inherit"
        indicatorColor="primary"
        sx={{ 
          mb: 2,
          minHeight: '36px',
          '& .MuiTab-root': {
            minHeight: '36px',
            py: 0.5,
            fontSize: '0.75rem'
          }
        }}
      >
        <Tab 
          label="Tout" 
          sx={{ 
            color: 'white',
            '&.Mui-selected': { color: 'primary.main', fontWeight: 'bold' }
          }} 
        />
        <Tab 
          label={
            <ActivityBadge badgeContent={alertCount} color="error" max={99}>
              <Box sx={{ px: 1 }}>Alertes</Box>
            </ActivityBadge>
          }
          sx={{ 
            color: 'white', 
            '&.Mui-selected': { color: 'error.main', fontWeight: 'bold' }
          }} 
        />
        <Tab 
          label="Objets" 
          sx={{ 
            color: 'white',
            '&.Mui-selected': { color: 'info.main', fontWeight: 'bold' }
          }} 
        />
        <Tab 
          label="Utilisateurs" 
          sx={{ 
            color: 'white',
            '&.Mui-selected': { color: 'primary.main', fontWeight: 'bold' }
          }} 
        />
      </Tabs>
      
      <Paper sx={{ 
        p: 0, 
        bgcolor: 'rgba(20, 20, 30, 0.7)',
        backgroundImage: 'url("/images/pattern-dots.svg")',
        backgroundRepeat: 'repeat',
        backgroundSize: '20px',
        backgroundBlendMode: 'overlay',
        borderRadius: 2,
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {filteredItems.length > 0 ? (
          <>
            <List sx={{ py: 0 }}>
              {filteredItems.slice(0, displayCount).map((item, index) => (
                <ActivityItem
                  key={item.id}
                  eventType={item.eventType}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.05 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        bgcolor: item.eventType === 'login' ? 'primary.dark' :
                                 item.eventType === 'update' ? 'info.dark' :
                                 item.eventType === 'alert' ? 'error.dark' :
                                 item.eventType === 'expo' ? 'secondary.dark' :
                                 'grey.700'
                      }}
                    >
                      {getActivityIcon(item.type)}
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        mb: 0.5
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                          {item.message}
                        </Typography>
                        
                        <TimeChip 
                          size="small" 
                          label={formatTime(item.timestamp)}
                          icon={<AccessTimeIcon sx={{ fontSize: '0.8rem !important' }} />}
                        />
                      </Box>
                      
                      {item.sourceType === 'action' && (
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                          Utilisateur: {item.user} • Niveau: {item.level}
                        </Typography>
                      )}
                      
                      {item.sourceType === 'objectUpdate' && (
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                          Type: {item.objectType || "Inconnu"} • ID: {item.objectId} 
                          {item.roomId && ` • Salle: ${item.roomId}`}
                        </Typography>
                      )}
                      
                      {item.sourceType === 'alert' && (
                        <Box sx={{ mt: 0.5 }}>
                          <Chip 
                            size="small"
                            label={item.objectType || "Capteur"}
                            sx={{ 
                              height: '18px', 
                              fontSize: '0.65rem',
                              bgcolor: 'rgba(255,255,255,0.1)',
                              mr: 0.5
                            }} 
                          />
                          <Chip 
                            size="small"
                            label={item.roomName || "Salle"}
                            sx={{ 
                              height: '18px', 
                              fontSize: '0.65rem',
                              bgcolor: 'rgba(255,255,255,0.1)' 
                            }} 
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </ActivityItem>
              ))}
            </List>
            
            {filteredItems.length > displayCount && (
              <Box sx={{ 
                p: 1.5, 
                display: 'flex', 
                justifyContent: 'center', 
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Button 
                  size="small" 
                  variant="text" 
                  onClick={handleLoadMore}
                  startIcon={<KeyboardDoubleArrowDownIcon />}
                >
                  Afficher plus d'activités
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center', opacity: 0.7 }}>
            <Typography>Aucune activité à afficher</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ActivityPanel; 