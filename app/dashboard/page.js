"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import MapIcon from '@mui/icons-material/Map';
import BarChartIcon from '@mui/icons-material/BarChart';
import SpeedIcon from '@mui/icons-material/Speed';
import Grid from '@mui/material/Grid';

// Import original dashboard components
import ObjectsStats from '../../components/dashboard/ObjectsStats';
import ObjectsPanel from '../../components/dashboard/ObjectsPanel';
import DataPanel from '../../components/dashboard/DataPanel';
import RoomsPanel from '../../components/dashboard/RoomsPanel';
import HistoryPanel from '../../components/dashboard/HistoryPanel';

// Import new interactive dashboard components
import RoomMap from '../../components/dashboard/RoomMap';
import FloorPlanView from '../../components/dashboard/FloorPlanView';
import ObjectTypeGrid from '../../components/dashboard/ObjectTypeGrid';
import ObjectVisualizer from '../../components/dashboard/ObjectVisualizer';
import FilteredObjectList from '../../components/dashboard/FilteredObjectList';
import ObjectDataChart from '../../components/dashboard/ObjectDataChart';
import SensorStatusPanel from '../../components/dashboard/SensorStatusPanel';

// Import new optimized components
import CompactRoomGrid from '../../components/dashboard/CompactRoomGrid';
import EnhancedObjectGrid from '../../components/dashboard/EnhancedObjectGrid';
import ActivityPanel from '../../components/dashboard/ActivityPanel';

import '../../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardView, setDashboardView] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // New states for the interactive dashboard
  const [rooms, setRooms] = useState([]);
  const [objects, setObjects] = useState([]);
  const [objectData, setObjectData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showLegacyDashboard, setShowLegacyDashboard] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [historyActions, setHistoryActions] = useState([]);
  const [objectDataHistory, setObjectDataHistory] = useState([]);
  
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/checkUser", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login?msgError=Session+expired");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);

        // Récupérer les permissions basées sur les points de l'utilisateur
        const permissionsResponse = await fetch(`/api/user/getUserPermissions?points=${userData.point || 0}`, {
          method: "GET",
          credentials: "include",
        });

        if (permissionsResponse.ok) {
          const permissionsData = await permissionsResponse.json();
          setPermissions(permissionsData.permissions || {});
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Unable to load user data. Please try again later.");
      }
    };

    fetchUserData();
  }, [router]);
  
  // Fetch all required data for the interactive dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rooms data
        const roomsResponse = await fetch('/api/rooms/getRooms', {
          credentials: 'include'
        });
        
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          setRooms(roomsData.rooms || []);
        } else {
          console.error('Failed to fetch rooms data');
        }
        
        // Fetch objects data
        const objectsResponse = await fetch('/api/objects/getObjects', {
          credentials: 'include'
        });
        
        if (objectsResponse.ok) {
          const objectsData = await objectsResponse.json();
          setObjects(objectsData.objects || []);
        } else {
          console.error('Failed to fetch objects data');
        }
        
        // Fetch object instances data
        const objectDataResponse = await fetch('/api/objectData/listAllDatas', {
          credentials: 'include'
        });
        
        if (objectDataResponse.ok) {
          const data = await objectDataResponse.json();
          setObjectData(Array.isArray(data.objectData) ? data.objectData : []);
        } else {
          console.error('Failed to fetch object data');
        }
        
        // Fetch history actions
        const historyResponse = await fetch('/api/dashboard/getHistory', {
          credentials: 'include'
        });
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistoryActions(historyData.historyActions || []);
        } else {
          console.error('Failed to fetch history data');
        }
        
        // Fetch object data history
        const objectHistoryResponse = await fetch('/api/objectData/getHistory', {
          credentials: 'include'
        });
        
        if (objectHistoryResponse.ok) {
          const historyData = await objectHistoryResponse.json();
          setObjectDataHistory(historyData.history || []);
        } else {
          console.error('Failed to fetch object history data');
        }
        
        // Generate mock sensor data for demo
        const generateSensorData = (rooms) => {
          if (!Array.isArray(rooms)) return [];
          
          const sensorTypes = ['temperature', 'humidity', 'light', 'security', 'power'];
          const sensors = [];
          
          rooms.forEach(room => {
            // Each room gets 1-3 random sensors
            const sensorCount = Math.floor(Math.random() * 3) + 1;
            const roomSensorTypes = [];
            
            // Make sure we don't add duplicate sensor types to a room
            while (roomSensorTypes.length < sensorCount) {
              const randomType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
              if (!roomSensorTypes.includes(randomType)) {
                roomSensorTypes.push(randomType);
              }
            }
            
            roomSensorTypes.forEach(type => {
              // Generate random values
              let value, status;
              
              if (type === 'temperature') {
                value = Math.round((Math.random() * 10 + 18) * 10) / 10; // 18-28°C
                status = value > 27 ? 'alert' : value > 25 ? 'warning' : 'good';
              } else if (type === 'humidity') {
                value = Math.round(Math.random() * 30 + 40); // 40-70%
                status = value > 65 ? 'alert' : value > 60 ? 'warning' : 'good';
              } else if (type === 'security') {
                value = Math.random() > 0.9 ? 'BREACH' : 'SECURE';
                status = value === 'BREACH' ? 'alert' : 'good';
              } else {
                value = Math.round(Math.random() * 100);
                status = Math.random() < 0.1 ? 'alert' : Math.random() < 0.2 ? 'warning' : 'good';
              }
              
              // Create sensor object
              sensors.push({
                id: `sensor-${room.id}-${type}`,
                room_id: room.id,
                type,
                value,
                status,
                last_update: new Date(Date.now() - Math.random() * 3600000).toISOString()
              });
            });
          });
          
          return sensors;
        };
        
        if (roomsResponse.ok) {
          setSensorData(generateSensorData(roomsData.rooms || []));
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (index) => {
    setActiveTab(index);
  };
  
  const handleDashboardViewChange = (event, newValue) => {
    setDashboardView(newValue);
  };
  
  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
  };
  
  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };
  
  const handleClearFilters = () => {
    setSelectedRoom(null);
    setSelectedType(null);
  };
  
  const toggleDashboardView = () => {
    setShowLegacyDashboard(!showLegacyDashboard);
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (!user?.isActive) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="card-title" style={{ textAlign: 'center' }}>Account not activated</h2>
            <p>Your account isn't activated yet. Please check your email for an activation link.</p>
            <p>If you want to receive a new activation link, recreate your account with the same email.</p>
            <p>The activation link is valid for 1 hour. Check your inbox (and your spam folder) for the link.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Museum Dashboard
          </Typography>
          <IconButton 
            color="primary" 
            onClick={toggleDashboardView}
            title={showLegacyDashboard ? "Show Interactive Dashboard" : "Show Legacy Dashboard"}
            sx={{ ml: 2 }}
          >
            {showLegacyDashboard ? <FilterListIcon /> : <FilterListOffIcon />}
          </IconButton>
        </Box>
        
        {!showLegacyDashboard ? (
          // New Visual Interactive Dashboard
          <>
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: 'rgba(20, 20, 30, 0.7)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <Tabs 
                value={dashboardView} 
                onChange={handleDashboardViewChange} 
                variant="fullWidth"
                textColor="inherit"
                indicatorColor="primary"
                sx={{ 
                  mb: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none', 
                    fontSize: '0.9rem',
                    fontWeight: 'normal',
                    color: 'white',
                    opacity: 0.7,
                    '&.Mui-selected': {
                      color: 'white',
                      opacity: 1,
                      fontWeight: 'bold',
                    }
                  }
                }}
              >
                <Tab 
                  label="Plan du Musée" 
                  icon={<MapIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Collection" 
                  icon={<ViewQuiltIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Analytiques" 
                  icon={<BarChartIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Surveillance" 
                  icon={<SpeedIcon />} 
                  iconPosition="start"
                />
              </Tabs>
              
              {selectedRoom || selectedType ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleClearFilters}
                    size="small"
                  >
                    Clear All Filters
                  </Button>
                </Box>
              ) : null}
              
              {/* Dashboard Content based on tab */}
              {dashboardView === 0 && (
                <>
                  {/* Vue du plan du musée */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <CompactRoomGrid 
                        rooms={rooms} 
                        objects={objects} 
                        onRoomSelect={handleRoomSelect}
                        selectedRoom={selectedRoom}
                        sensorData={sensorData}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ActivityPanel 
                        historyActions={historyActions}
                        objectDataHistory={objectDataHistory}
                        objects={objects}
                        objectData={objectData}
                        rooms={rooms}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <EnhancedObjectGrid 
                        objects={objects} 
                        objectData={objectData}
                        selectedRoom={selectedRoom} 
                        onTypeSelect={handleTypeSelect} 
                        selectedType={selectedType}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
              
              {dashboardView === 1 && (
                <>
                  {/* Vue de la collection */}
                  <CompactRoomGrid 
                    rooms={rooms} 
                    objects={objects} 
                    onRoomSelect={handleRoomSelect}
                    selectedRoom={selectedRoom}
                    sensorData={sensorData}
                  />
                  
                  <EnhancedObjectGrid 
                    objects={objects} 
                    objectData={objectData}
                    selectedRoom={selectedRoom} 
                    onTypeSelect={handleTypeSelect} 
                    selectedType={selectedType}
                  />
                  
                  <FilteredObjectList 
                    objects={objects} 
                    objectData={objectData} 
                    rooms={rooms} 
                    selectedRoom={selectedRoom} 
                    selectedType={selectedType} 
                    onClearRoom={() => setSelectedRoom(null)} 
                    onClearType={() => setSelectedType(null)} 
                  />
                </>
              )}
              
              {dashboardView === 2 && (
                <>
                  {/* Vue des analytiques */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <CompactRoomGrid 
                        rooms={rooms} 
                        objects={objects} 
                        onRoomSelect={handleRoomSelect}
                        selectedRoom={selectedRoom}
                        sensorData={sensorData}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ActivityPanel 
                        historyActions={historyActions}
                        objectDataHistory={objectDataHistory}
                        objects={objects}
                        objectData={objectData}
                        rooms={rooms}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ObjectDataChart 
                        objects={objects}
                        objectData={objectData}
                        rooms={rooms}
                        selectedRoom={selectedRoom}
                        selectedType={selectedType}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
              
              {dashboardView === 3 && (
                <>
                  {/* Vue de surveillance */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                      <CompactRoomGrid 
                        rooms={rooms} 
                        objects={objects} 
                        onRoomSelect={handleRoomSelect}
                        selectedRoom={selectedRoom}
                        sensorData={sensorData}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <ActivityPanel 
                        historyActions={historyActions.filter(a => a.type === 'login' || a.type === 'expoVisit')}
                        objectDataHistory={objectDataHistory}
                        objects={objects}
                        objectData={objectData}
                        rooms={rooms}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <SensorStatusPanel 
                        rooms={rooms} 
                        selectedRoom={selectedRoom}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Paper>
            
            {/* Condensed Analytics Section at bottom */}
            <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.4)' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Dashboard Analytics</Typography>
              <ObjectsStats permissions={permissions} />
            </Paper>
          </>
        ) : (
          // Legacy Dashboard - Original View
          <>
            <div className="dashboard-panel dashboard-stats-panel">
              <ObjectsStats permissions={permissions} />
            </div>

            <div className="dashboard-panel dashboard-content-panel">
              <div className="tabs">
                {permissions.readObject &&
                  <div
                    className={`tab ${activeTab === 0 ? 'tab-active' : ''}`}
                    onClick={() => handleTabChange(0)}
                  >
                    Objects
                  </div>
                }
                {permissions.readData &&
                  <div
                    className={`tab ${activeTab === 1 ? 'tab-active' : ''}`}
                    onClick={() => handleTabChange(1)}
                  >
                    Data
                  </div>
                }
                {permissions.readRoom &&
                  <div
                    className={`tab ${activeTab === 2 ? 'tab-active' : ''}`}
                    onClick={() => handleTabChange(2)}
                  >
                    Rooms
                  </div>
                }
                {permissions.readData &&
                  <div
                    className={`tab ${activeTab === 3 ? 'tab-active' : ''}`}
                    onClick={() => handleTabChange(3)}
                  >
                    History
                  </div>
                }
              </div>

              {/* Content based on selected tab */}
              <div style={{ width: '100%', maxWidth: '100%' }}>
                {activeTab === 0 && permissions.readObject &&
                  <ObjectsPanel
                    permissions={permissions}
                    searchQuery={searchQuery}
                    searchResults={searchResults}
                  />
                }
                {activeTab === 1 && permissions.readData &&
                  <DataPanel
                    permissions={permissions}
                    searchQuery={searchQuery}
                    searchResults={searchResults}
                  />
                }
                {activeTab === 2 && permissions.readRoom &&
                  <RoomsPanel
                    permissions={permissions}
                    searchQuery={searchQuery}
                    searchResults={searchResults}
                  />
                }
                {activeTab === 3 && permissions.readData &&
                  <HistoryPanel
                    permissions={permissions}
                    searchQuery={searchQuery}
                    searchResults={searchResults}
                  />
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
