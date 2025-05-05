"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import BackupIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import UserProfileDetails from '../../components/settings/UserProfileDetails';
import UserAccessLevel from '../../components/settings/UserAccessLevel';
import Rolling from '../../components/rolling';
import '../../styles/dashboard.css';

export default function Settings() {
    const router = useRouter();
    const { setIsAuthenticated } = useAuth();
    const [userData, setUserData] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openBackupDialog, setOpenBackupDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // 1. Vérifier si l'utilisateur est connecté
                const authCheck = await fetch("/api/user/checkUser", {
                    method: "POST",
                    credentials: "include"
                });

                if (!authCheck.ok) {
                    router.push("/login");
                    return;
                }

                const authData = await authCheck.json();

                // 2. Récupérer les données complètes du profil avec getUserProfil (plus approprié pour la page profil)
                const profilResponse = await fetch(`/api/user/getUserProfil?pseudo=${authData.pseudo}`, {
                    method: "GET",
                    credentials: "include"
                });

                if (!profilResponse.ok) {
                    console.error("Error fetching user profile:", await profilResponse.text());
                    return;
                }

                const profilData = await profilResponse.json();

                // Debug: Vérifions les données utilisateur reçues de getUserProfil
                console.log("Données utilisateur reçues de getUserProfil:", {
                    data: profilData.data,
                    points: profilData.data.points,
                    level: profilData.data.level,
                    role: profilData.data.role
                });

                // Utiliser les données du profil, avec fallback sur les données d'authentification si nécessaire
                const userData = {
                    ...profilData.data,
                    // Pour les cas où checkUser a des données que getUserProfil n'a pas
                    isActive: profilData.data.isActive !== undefined ? profilData.data.isActive : authData.isActive,
                    role: profilData.data.role || authData.role,
                    level: profilData.data.level || authData.level, // S'assurer que level est présent
                    // Pour gérer le problème des points
                    point: profilData.data.points, // getUserProfil utilise 'points'
                };

                setUserData(userData);

                // Récupérer les permissions en utilisant le niveau stocké en base de données
                // et non plus en utilisant un calcul basé sur les points
                const userLevel = userData.level || 'beginner'; // Fallback sur 'beginner' si pas de niveau

                const permissionsResponse = await fetch(`/api/user/getUserPermissions?level=${userLevel}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (permissionsResponse.ok) {
                    const permissionsData = await permissionsResponse.json();
                    setPermissions(permissionsData.permissions || {});
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
            if (response.ok) {
                setIsAuthenticated(false);
                router.push("/login");
            }
        } catch (error) {
            console.error("Error while disconnecting:", error);
        }
    };

    const handleDownload = async (format) => {
        try {
            const response = await fetch(`/api/user/backupDBAdmin?format=${format}`, {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to download backup:", errorText);
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const dateStr = new Date().toISOString().split("T")[0];
            a.href = url;
            a.download = `backup-${dateStr}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setOpenBackupDialog(false);
        } catch (error) {
            console.error("An error occurred during the backup:", error);
        }
    }

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        try {
            const response = await fetch("/api/user/setUserPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
                credentials: "include"
            });

            if (response.ok) {
                toast.success("Password changed successfully");
                setOpenPasswordDialog(false);
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await response.json();
                toast.error(data.error || "Error changing password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Error changing password");
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch("/api/user/deleteAccount", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userToDelete: userData.pseudo })
            });

            if (response.ok) {
                toast.success("Account deleted successfully");
                setIsAuthenticated(false);
                router.push("/login");
            } else {
                const data = await response.json();
                toast.error(data.error || "Error deleting account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            toast.error("Error deleting account");
        }
    };

    if (isLoading) {
        return (
            <div className="settings-container">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <div>{Rolling(50, 50, "#fff")}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <div className="settings-container">
                <h1 className="settings-title">Account Settings</h1>

                <div className="grid-container" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(12, 1fr)', 
                    gap: '24px', 
                    width: '100%', 
                    maxWidth: '100%' 
                }}>
                    <div style={{ gridColumn: 'span 12' }}>
                        <div className="settings-panel settings-profile-panel">
                            {userData && permissions && (
                                <UserProfileDetails user={userData} permissions={permissions} />
                            )}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 12' }}>
                        <div className="settings-panel">
                            {userData && (
                                <UserAccessLevel userData={userData} />
                            )}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 12' }}>
                        <div className="card settings-actions-card">
                            <h2 className="card-title">Account Actions</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {userData?.level === "expert" && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setOpenBackupDialog(true)}
                                    >
                                        <BackupIcon style={{ fontSize: '1.2rem' }} />

                                        Backup Database
                                    </button>

                                )}
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setOpenPasswordDialog(true)}
                                >
                                    <VpnKeyIcon style={{ fontSize: '1.2rem' }} />
                                    Change Password
                                </button>

                                <button
                                    className="btn btn-secondary"
                                    onClick={handleLogout}
                                >
                                    <LogoutIcon style={{ fontSize: '1.2rem' }} />
                                    Logout
                                </button>

                                <div className="divider"></div>

                                <button
                                    className="btn btn-danger"
                                    onClick={() => setOpenDeleteDialog(true)}
                                >
                                    <DeleteIcon style={{ fontSize: '1.2rem' }} />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change Dialog */}
                <Dialog
                    open={openPasswordDialog}
                    onClose={() => setOpenPasswordDialog(false)}
                    PaperProps={{
                        style: { 
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
                            borderRadius: 0,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            maxWidth: '500px',
                            width: '100%',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
                        }
                    }}
                    sx={{
                        '& .MuiBackdrop-root': {
                            backdropFilter: 'blur(6px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        }
                    }}
                >
                    <DialogTitle 
                        sx={{ 
                            fontFamily: 'var(--font-cinzel)', 
                            color: 'white', 
                            fontSize: '1.8rem', 
                            borderBottom: 'none',
                            padding: '1.5rem 2rem 0.5rem 2rem',
                            letterSpacing: '2px',
                            fontWeight: 300
                        }}
                    >
                        Change Password
                    </DialogTitle>
                    <DialogContent sx={{ padding: '2rem' }}>
                        <DialogContentText 
                            sx={{ 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                marginBottom: '1.5rem',
                                fontFamily: 'var(--font-roboto)',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Please enter your new password twice to confirm.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="New Password"
                            type="password"
                            fullWidth
                            variant="standard"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={{
                                mt: 2,
                                mb: 3,
                                input: { color: 'white' },
                                label: { color: 'rgba(255, 255, 255, 0.7)' },
                                '& .MuiInput-underline:before': { 
                                    borderBottomColor: 'rgba(255, 255, 255, 0.3)' 
                                },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { 
                                    borderBottomColor: 'rgba(255, 255, 255, 0.5)' 
                                },
                                '& .MuiInput-underline:after': { 
                                    borderBottomColor: 'white' 
                                }
                            }}
                        />
                        <TextField
                            margin="dense"
                            label="Confirm Password"
                            type="password"
                            fullWidth
                            variant="standard"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{
                                mb: 2,
                                input: { color: 'white' },
                                label: { color: 'rgba(255, 255, 255, 0.7)' },
                                '& .MuiInput-underline:before': { 
                                    borderBottomColor: 'rgba(255, 255, 255, 0.3)' 
                                },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { 
                                    borderBottomColor: 'rgba(255, 255, 255, 0.5)' 
                                },
                                '& .MuiInput-underline:after': { 
                                    borderBottomColor: 'white' 
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions 
                        sx={{ 
                            padding: '1.5rem 2rem',
                            borderTop: 'none'
                        }}
                    >
                        <Button 
                            onClick={() => setOpenPasswordDialog(false)} 
                            sx={{ 
                                color: 'white',
                                padding: '0.5rem 1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                fontSize: '0.85rem',
                                borderRadius: 0,
                                fontFamily: 'var(--font-roboto)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handlePasswordChange} 
                            variant="contained" 
                            sx={{
                                backgroundColor: 'white',
                                color: 'black',
                                padding: '0.5rem 1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                fontSize: '0.85rem',
                                borderRadius: 0,
                                fontFamily: 'var(--font-roboto)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                                }
                            }}
                        >
                            Change
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Backup Database Dialog */}
                <Dialog
                    open={openBackupDialog}
                    onClose={() => setOpenBackupDialog(false)}
                    PaperProps={{
                        style: {
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
                            borderRadius: 0,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            maxWidth: '500px',
                            width: '100%',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
                        }
                    }}
                    sx={{
                        '& .MuiBackdrop-root': {
                            backdropFilter: 'blur(6px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        }
                    }}
                >
                    <DialogTitle
                        sx={{
                            fontFamily: 'var(--font-cinzel)',
                            color: 'white',
                            fontSize: '1.8rem',
                            borderBottom: 'none',
                            padding: '1.5rem 2rem 0.5rem 2rem',
                            letterSpacing: '2px',
                            fontWeight: 300
                        }}
                    >
                        Database Backup
                    </DialogTitle>
                    <DialogContent sx={{ padding: '2rem' }}>
                        <DialogContentText
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                marginBottom: '1.5rem',
                                fontFamily: 'var(--font-roboto)',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Choose the format you want to export your database:
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            padding: '1.5rem 2rem',
                            borderTop: 'none'
                        }}
                    >
                        <Button
                            onClick={() => setOpenBackupDialog(false)}
                            sx={{
                                color: 'white',
                                padding: '0.5rem 1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                fontSize: '0.85rem',
                                borderRadius: 0,
                                fontFamily: 'var(--font-roboto)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleDownload('csv')}
                            variant="outlined"
                            sx={{
                                color: 'white',
                                borderColor: 'white',
                                padding: '0.5rem 1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                fontSize: '0.85rem',
                                borderRadius: 0,
                                fontFamily: 'var(--font-roboto)',
                                '&:hover': {
                                    borderColor: 'rgba(255, 255, 255, 0.8)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Export CSV
                        </Button>
                        <Button
                            onClick={() => handleDownload('sql')}
                            variant="contained"
                            sx={{
                                backgroundColor: 'white',
                                color: 'black',
                                padding: '0.5rem 1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                fontSize: '0.85rem',
                                borderRadius: 0,
                                fontFamily: 'var(--font-roboto)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                                }
                            }}
                        >
                            Export SQL
                        </Button>
                    </DialogActions>
                </Dialog>


                {/* Delete Account Dialog */}
                <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                    PaperProps={{
                        style: { 
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
                            borderRadius: 0,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            maxWidth: '500px',
                            width: '100%',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
                        }
                    }}
                    sx={{
                        '& .MuiBackdrop-root': {
                            backdropFilter: 'blur(6px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        }
                    }}
                >
                    <DialogTitle 
                        sx={{ 
                            fontFamily: 'var(--font-cinzel)', 
                            color: 'white', 
                            fontSize: '1.8rem', 
                            borderBottom: 'none',
                            padding: '1.5rem 2rem 0.5rem 2rem',
                            letterSpacing: '2px',
                            fontWeight: 300
                        }}
                    >
                        Delete Account
                    </DialogTitle>
                    <DialogContent sx={{ padding: '2rem' }}>
                        <DialogContentText 
                            sx={{ 
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontFamily: 'var(--font-roboto)',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions 
                        sx={{ 
                            padding: '1.5rem 2rem',
                            borderTop: 'none'
                        }}
                    >
                        <Button 
                            onClick={() => setOpenDeleteDialog(false)} 
                            sx={{ 
                                color: 'white',
                                padding: '0.5rem 1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                fontSize: '0.85rem',
                                borderRadius: 0,
                                fontFamily: 'var(--font-roboto)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteAccount} 
                            variant="contained" 
                            sx={{
                                backgroundColor: '#8b2000',
                                color: 'white',
                                padding: '0.5rem 1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                fontSize: '0.85rem',
                                borderRadius: 0,
                                fontFamily: 'var(--font-roboto)',
                                '&:hover': {
                                    backgroundColor: '#c62828'
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
} 