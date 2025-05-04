"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import '../../styles/dashboard.css';

// Définition du dictionnaire de traduction des niveaux
const levelMap = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert'
};

const UserProfileDetails = ({ user, permissions }) => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInput = useRef(null);

  // Debug: Afficher les points utilisateur de manière plus détaillée
  useEffect(() => {
    if (user) {
      console.log("UserProfileDetails - Données utilisateur:", {
        points: user.points,
        dbLevel: user.level,
        allUserKeys: Object.keys(user)
      });
    }
  }, [user]);

  // Utiliser le niveau de la base de données
  const userLevel = user.level || 'beginner'; // Fallback sur beginner si level n'existe pas
  const userPoints = user.points || 0; // Utilisez directement les points stockés dans user

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setAvatarUrl(fileUrl);
      handleUpload(file);
    }
  };

  const handleUpload = async (fileToUpload) => {
    if (!fileToUpload) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64 = reader.result.split(",")[1];
        const response = await fetch("/api/auth/uploadAvatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pseudo: user.pseudo,
            imageBase64: base64
          }),
        });

        if (response.ok) {
          toast.success("Avatar updated successfully");
        } else {
          const data = await response.json();
          toast.error(data.error || "Error uploading avatar");
          // Revert to previous avatar if upload fails
          fetchAvatar();
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Error uploading avatar");
        // Revert to previous avatar if upload fails
        fetchAvatar();
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(fileToUpload);
  };

  const fetchAvatar = async () => {
    try {
      const res = await fetch("/api/getAvatarUrl", {
        method: "GET",
        headers: { pseudo: user.pseudo }
      });

      const json = await res.json();

      if (json.url) {
        setAvatarUrl(json.url);
      } else {
        setAvatarUrl("/images/avatar.svg");
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
      setAvatarUrl("/images/avatar.svg");
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      <h2 className="card-title">User Profile</h2>

      <div className="user-profile-grid">
        {/* Informations de base */}
        <div className="user-profile-col">
          <div className="card">
            <div className="user-profile">
              {isAvatarLoaded ? (
                <div className="avatar-container" style={{ position: 'relative' }}>
                  <img
                    src={avatarUrl}
                    alt={user.pseudo}
                    className="user-avatar"
                    style={{ cursor: 'pointer' }}
                    onClick={() => fileInput.current.click()}
                  />
                  {isUploading && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%'
                    }}>
                      <div className="spinner"></div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInput}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <Skeleton
                  variant="circular"
                  width={120}
                  height={120}
                  sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                />
              )}

              <Button
                variant="outlined"
                onClick={() => fileInput.current.click()}
                sx={{
                  fontSize: 13,
                  borderRadius: 0,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
                  mb: 2,
                  mt: 1
                }}
              >
                {isUploading ? 'Uploading...' : 'Change Avatar'}
              </Button>

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