"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ObjectsStats from '../../components/dashboard/ObjectsStats';
import ObjectsPanel from '../../components/dashboard/ObjectsPanel';
import DataPanel from '../../components/dashboard/DataPanel';
import RoomsPanel from '../../components/dashboard/RoomsPanel';
import HistoryPanel from '../../components/dashboard/HistoryPanel';
import '../../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/index?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        
        // Changer automatiquement l'onglet en fonction du type de résultat trouvé
        if (data.length > 0) {
          const firstResult = data[0];
          if (firstResult.type === "Objet" && permissions.readObject) {
            // Trouver l'index de l'onglet Objets
            const tabIndex = [
              permissions.readObject, 
              permissions.readData, 
              permissions.readRoom, 
              permissions.readData
            ].findIndex(p => p === true);
            
            if (tabIndex >= 0) {
              setActiveTab(tabIndex);
            }
          }
        }
      } else {
        console.error("Search API error:", response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error in search:", error);
      setSearchResults([]);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (!user?.isActive) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="card-title" style={{ textAlign: 'center' }}>Account not activated</h2>
          <p>Your account isn't activated yet. Please check your email for an activation link.</p>
          <p>If you want to receive a new activation link, recreate your account with the same email.</p>
          <p>The activation link is valid for 1 hour. Check your inbox (and your spam folder) for the link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

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
  );
}
