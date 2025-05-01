"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { getUserLevel, levelMap, getUserPoints } from '../../lib/userLevelUtils';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Skeleton from '@mui/material/Skeleton';
import '../../styles/dashboard.css';

const UserProfileDetails = ({ user, permissions }) => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  
  // Debug: Afficher les points utilisateur de manière plus détaillée
  useEffect(() => {
    if (user) {
      console.log("UserProfileDetails - Données utilisateur:", {
        point: user.point,
        pointsss: user.pointsss,
        points: user.points,
        calculatedPoints: getUserPoints(user),
        calculatedLevel: getUserLevel(user),
        allUserKeys: Object.keys(user)
      });
    }
  }, [user]);
  
  // Obtenir le niveau actuel et les points de l'utilisateur avec nos fonctions d'utilitaire
  const userLevel = getUserLevel(user);
  const userPoints = getUserPoints(user);
  
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await fetch("/api/getAvatarUrl", {
          method: "GET",
          headers: { pseudo: user.pseudo }
        });
        
        const json = await res.json();
        
        if (json.url) {
          const img = new Image();
          img.src = json.url;
          
          img.onload = () => {
            setAvatarUrl(json.url);
            setIsAvatarLoaded(true);
          };
          
          img.onerror = () => {
            setAvatarUrl("/images/avatar.svg");
            setIsAvatarLoaded(true);
          };
        } else {
          setAvatarUrl("/images/avatar.svg");
          setIsAvatarLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
        setAvatarUrl("/images/avatar.svg");
        setIsAvatarLoaded(true);
      }
    };

    if (user && user.pseudo) {
      fetchAvatar();
    }
  }, [user]);

  return (
    <div>
      <h2 className="card-title">User Profile</h2>
      
      <div className="user-profile-grid">
        {/* Informations de base */}
        <div className="user-profile-col">
          <div className="card">
            <div className="user-profile">
              {isAvatarLoaded ? (
                <img 
                  src={avatarUrl} 
                  alt={user.pseudo}
                  className="user-avatar"
                />
              ) : (
                <Skeleton 
                  variant="circular" 
                  width={120} 
                  height={120} 
                  sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} 
                />
              )}
              
              <h3 className="user-name">{user.pseudo}</h3>
              
              <div className="user-roles">
                <span className="user-role">
                  <PersonIcon className="user-role-icon" />
                  {levelMap[userLevel] || userLevel}
                </span>
                <span className="user-role">
                  <LockIcon className="user-role-icon" />
                  {user.role}
                </span>
              </div>
              
              <div className="divider"></div>
              
              <div className="user-info">
                <div className="user-info-label">Name:</div>
                <div className="user-info-value">{user.name || '-'} {user.lastName || ''}</div>
                
                <div className="user-info-label">Email:</div>
                <div className="user-info-value">{user.email || '-'}</div>
                
                <div className="user-info-label">Points:</div>
                <div className="user-info-value">{userPoints}</div>
                
                <div className="user-info-label">Level:</div>
                <div className="user-info-value">{levelMap[userLevel] || userLevel}</div>
                
                <div className="user-info-label">Role:</div>
                <div className="user-info-value">{user.role || '-'}</div>
                
                <div className="user-info-label">Account active:</div>
                <div className="user-info-value">
                  {user.isActive ? 
                    <CheckCircleIcon fontSize="small" sx={{ color: '#4caf50', verticalAlign: 'middle', mr: 0.5 }} /> : 
                    <CancelIcon fontSize="small" sx={{ color: '#f44336', verticalAlign: 'middle', mr: 0.5 }} />
                  }
                  {user.isActive ? 'Yes' : 'No'}
                </div>
                
                <div className="user-info-label">Last login:</div>
                <div className="user-info-value">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tableau des permissions */}
        <div className="permissions-col">
          <div className="card permissions-card">
            <h3 className="card-subtitle">User Permissions</h3>
            <p className="permissions-level-info">
              Based on your current level: {levelMap[userLevel] || userLevel}
            </p>
            
            <div className="table-container">
              <table className="table permissions-table">
                <thead>
                  <tr>
                    <th>Permission</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions && Object.entries(permissions).map(([key, value]) => (
                    <tr key={key}>
                      <td>
                        {key.replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())
                          .replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </td>
                      <td>
                        {value ? 
                          <span className="user-role status-allowed">
                            <CheckCircleIcon fontSize="small" />
                            Allowed
                          </span> : 
                          <span className="user-role status-not-allowed">
                            <CancelIcon fontSize="small" />
                            Not allowed
                          </span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="permissions-footer">
              <p className="permissions-info-text">
                To gain more permissions, continue earning points by interacting with the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails; 