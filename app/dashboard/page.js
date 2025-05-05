"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DevicesIcon from '@mui/icons-material/Devices';

// Import MUI theme registry
import ThemeRegistry from '../../components/ThemeRegistry';

// Import original dashboard components
import ObjectsStats from '../../components/dashboard/ObjectsStats';
import ObjectsPanel from '../../components/dashboard/ObjectsPanel';
import DataPanel from '../../components/dashboard/DataPanel';
import RoomsPanel from '../../components/dashboard/RoomsPanel';
import HistoryPanel from '../../components/dashboard/HistoryPanel';

// Import new interactive dashboard components
import ObjectTypeGrid from '../../components/dashboard/ObjectTypeGrid';
import FloorOverview from '../../components/dashboard/FloorOverview';

import '../../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // New states for the interactive dashboard
  const [rooms, setRooms] = useState([]);
  const [objects, setObjects] = useState([]);
  const [objectData, setObjectData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showLegacyDashboard, setShowLegacyDashboard] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    const tabParam = searchParams.get('tab');
    
    if (viewParam === 'legacy') {
      setShowLegacyDashboard(true);
      if (tabParam) {
        setActiveTab(parseInt(tabParam, 10));
      }
    }
    
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
      setIsLoading(true);
      try {
        // Fetch rooms data
        const roomsResponse = await fetch('/api/rooms/getRooms', {
          credentials: 'include'
        });
        
        if (!roomsResponse.ok) {
          console.error('Failed to fetch rooms data:', await roomsResponse.text());
          toast.error('Failed to load rooms data');
          return;
        }
        
        const roomsData = await roomsResponse.json();
        
        // Fetch objects data
        const objectsResponse = await fetch('/api/objects/getObjects', {
          credentials: 'include'
        });
        
        if (!objectsResponse.ok) {
          console.error('Failed to fetch objects data:', await objectsResponse.text());
          toast.error('Failed to load objects data');
          return;
        }
        
        const objectsData = await objectsResponse.json();
        
        // Fetch object instances data
        const objectDataResponse = await fetch('/api/objectData/listAllDatas', {
          credentials: 'include'
        });
        
        if (!objectDataResponse.ok) {
          console.error('Failed to fetch object data:', await objectDataResponse.text());
          toast.error('Failed to load object details');
          // Continue with other data since this isn't critical
        } else {
          const data = await objectDataResponse.json();
          setObjectData(Array.isArray(data.objectData) ? data.objectData : []);
        }
        
        // Set rooms and objects after verifying the data
        if (Array.isArray(roomsData.rooms) && Array.isArray(objectsData.objects)) {
          // Ensure floor is properly set for each room
          const processedRooms = roomsData.rooms.map(room => ({
            ...room,
            // Ensure floor is a string and defaulted if missing
            floor: room.floor !== undefined && room.floor !== null ? String(room.floor) : 'Unknown'
          }));
          
          setRooms(processedRooms);
          setObjects(objectsData.objects);
        } else {
          console.error('Invalid data format for rooms or objects');
          toast.error('Data format error - please contact support');
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
  
  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
  };
  
  const handleFloorSelect = (floorId) => {
    setSelectedFloor(floorId);
  };
  
  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };
  
  const toggleDashboardView = () => {
    setShowLegacyDashboard(!showLegacyDashboard);
  };

  if (isLoading) {
    return (
      <ThemeRegistry>
        <div className="dashboard-page">
          <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress sx={{ color: 'white' }} />
          </div>
        </div>
      </ThemeRegistry>
    );
  }

  if (!user?.isActive) {
    return (
      <ThemeRegistry>
        <div className="dashboard-page">
          <div className="dashboard-container">
            <div className="dashboard-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 className="card-title" style={{ textAlign: 'center', color: 'white' }}>Account not activated</h2>
              <p style={{ color: 'white' }}>Your account isn't activated yet. Please check your email for an activation link.</p>
              <p style={{ color: 'white' }}>If you want to receive a new activation link, recreate your account with the same email.</p>
              <p style={{ color: 'white' }}>The activation link is valid for 1 hour. Check your inbox (and your spam folder) for the link.</p>
            </div>
          </div>
        </div>
      </ThemeRegistry>
    );
  }

  return (
    <ThemeRegistry>
      <div className="dashboard-page">
        <div className="dashboard-container">
          <h1 className="dashboard-title">Dashboard</h1>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
            <IconButton 
              color="primary" 
              onClick={toggleDashboardView}
              title={showLegacyDashboard ? "Show Interactive Dashboard" : "Show Legacy Dashboard"}
            >
              {showLegacyDashboard ? <FilterListIcon /> : <FilterListOffIcon />}
            </IconButton>
          </Box>
          
          {!showLegacyDashboard ? (
            // New Visual Interactive Dashboard
            <>
              {/* Floor and Room Overview - First thing visible */}
              <div className="dashboard-panel">
                <FloorOverview 
                  rooms={rooms}
                  objects={objects}
                  objectData={objectData}
                  onRoomSelect={handleRoomSelect}
                  onFloorSelect={handleFloorSelect}
                  selectedRoom={selectedRoom}
                />
              </div>

              {/* Object Types Grid */}
              <div className="dashboard-panel">
                <ObjectTypeGrid 
                  objects={objects}
                  objectData={objectData}
                  selectedRoom={selectedRoom}
                  selectedFloor={selectedFloor}
                  selectedType={selectedType}
                  onTypeSelect={handleTypeSelect}
                  rooms={rooms}
                />
              </div>
            </>
          ) : (
            // Legacy Dashboard - Original View
            <>
              <div className="dashboard-panel dashboard-stats-panel">
                <ObjectsStats permissions={permissions} />
              </div>

              {/* On desktop, show the regular tabbed panel */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
              </Box>

              {/* On mobile, show two buttons for Rooms and Objects */}
              <Box sx={{ 
                display: { xs: 'flex', md: 'none' },
                flexDirection: 'column',
                gap: 2,
                p: 2,
                bgcolor: 'rgba(30, 30, 40, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mt: 2
              }}>
                <Typography variant="subtitle1" sx={{ 
                  color: 'white', 
                  mb: 1,
                  fontSize: '0.9rem',
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
                    N
                  </Box>
                  Quick Navigation
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  justifyContent: 'space-between'
                }}>
                  <Button 
                    variant="contained"
                    startIcon={<MeetingRoomIcon />}
                    sx={{ 
                      flexGrow: 1,
                      py: 1.5,
                      bgcolor: 'rgba(33, 150, 243, 0.8)',
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)',
                      '&:hover': {
                        bgcolor: 'rgba(33, 150, 243, 1)',
                      },
                      borderRadius: 0,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      boxShadow: 'none',
                      '&:active': {
                        boxShadow: 'none',
                        transform: 'translateY(1px)'
                      }
                    }}
                    onClick={() => {
                      // Si une room est sélectionnée, aller directement à cette room
                      if (selectedRoom) {
                        router.push(`/room/${selectedRoom}`);
                      } 
                      // Si un étage est sélectionné, chercher une room dans cet étage
                      else if (selectedFloor && rooms.length > 0) {
                        // Filtrer les rooms de cet étage
                        const roomsOnFloor = rooms.filter(room => 
                          room.floor !== undefined && String(room.floor) === String(selectedFloor)
                        );
                        
                        // S'il y a des rooms sur cet étage, en prendre une au hasard
                        if (roomsOnFloor.length > 0) {
                          const randomRoom = roomsOnFloor[Math.floor(Math.random() * roomsOnFloor.length)];
                          router.push(`/room/${randomRoom.id}`);
                        } else {
                          // Sinon prendre une room au hasard parmi toutes les rooms
                          if (rooms.length > 0) {
                            const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
                            router.push(`/room/${randomRoom.id}`);
                          } else {
                            router.push('/room');
                          }
                        }
                      }
                      // Sinon, prendre une room au hasard
                      else if (rooms.length > 0) {
                        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
                        router.push(`/room/${randomRoom.id}`);
                      } 
                      // En dernier recours, aller à la page générale des rooms
                      else {
                        router.push('/room');
                      }
                    }}
                  >
                    Rooms (random example)
                  </Button>
                  
                  <Button 
                    variant="contained"
                    startIcon={<DevicesIcon />}
                    sx={{ 
                      flexGrow: 1,
                      py: 1.5,
                      bgcolor: 'rgba(76, 175, 80, 0.8)',
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)',
                      '&:hover': {
                        bgcolor: 'rgba(76, 175, 80, 1)',
                      },
                      borderRadius: 0,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      boxShadow: 'none',
                      '&:active': {
                        boxShadow: 'none',
                        transform: 'translateY(1px)'
                      }
                    }}
                    onClick={() => {
                      // Si un type d'objet est sélectionné et qu'on a des données
                      if (selectedType && objectData.length > 0) {
                        // Filtrer les instances par type
                        const instancesOfType = objectData.filter(instance => 
                          instance.type_Object === selectedType
                        );
                        
                        // S'il y a des instances de ce type, en prendre une au hasard
                        if (instancesOfType.length > 0) {
                          const randomInstance = instancesOfType[Math.floor(Math.random() * instancesOfType.length)];
                          router.push(`/objectInstance/${randomInstance.id}`);
                          return;
                        }
                      }
                      
                      // Si une room est sélectionnée et qu'on a des données
                      if (selectedRoom && objectData.length > 0) {
                        // Filtrer les instances par room
                        const instancesInRoom = objectData.filter(instance => 
                          instance.room_id === selectedRoom
                        );
                        
                        // S'il y a des instances dans cette room, en prendre une au hasard
                        if (instancesInRoom.length > 0) {
                          const randomInstance = instancesInRoom[Math.floor(Math.random() * instancesInRoom.length)];
                          router.push(`/objectInstance/${randomInstance.id}`);
                          return;
                        }
                      }
                      
                      // Si on a des données d'instance, prendre une instance au hasard
                      if (objectData.length > 0) {
                        const randomInstance = objectData[Math.floor(Math.random() * objectData.length)];
                        router.push(`/objectInstance/${randomInstance.id}`);
                      } else {
                        // En dernier recours, aller à la page générale des instances
                        router.push('/objectInstance');
                      }
                    }}
                  >
                    Objects (random example)
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </div>
      </div>
    </ThemeRegistry>
  );
}
