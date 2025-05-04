"use client";

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from './AuthContext';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import PersonIcon from '@mui/icons-material/Person';
import ActivityIcon from '@mui/icons-material/TrackChanges';
import MessageIcon from '@mui/icons-material/Message';
import Badge from '@mui/material/Badge';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import {Box, Typography, useMediaQuery, useTheme} from '@mui/material';

export default function UserIconMenu({user}) {
    const router = useRouter();
    const {isAuthenticated, setIsAuthenticated} = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState("");
    const open = Boolean(anchorEl);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [unreadCount, setUnreadCount] = useState(0);

    // Récupérer l'avatar de l'utilisateur si connecté
    useEffect(() => {
        const fetchAvatar = async () => {
            if (isAuthenticated && user && user.pseudo) {
                try {
                    const res = await fetch("/api/getAvatarUrl", {
                        method: "GET",
                        headers: {pseudo: user.pseudo}
                    });

                    const json = await res.json();

                    if (json.url) {
                        setAvatarUrl(json.url);
                    } else {
                        setAvatarUrl("");
                    }
                } catch (error) {
                    console.error("Error fetching avatar:", error);
                    setAvatarUrl("");
                }

                // Récupérer le nombre de messages non lus uniqument l'admin
                if (user.level === "expert") {
                    try {
                        const res = await fetch("/api/message/unreadCount", {
                            method: "GET",
                            headers: {pseudo: user.pseudo}
                        });

                        const json = await res.json();
                        if (json.count !== undefined) {
                            setUnreadCount(json.count); // 👈 n'oublie pas d'avoir ce state
                        }
                    } catch (err) {
                        console.error("Error fetching unread message count:", err);
                        setUnreadCount(0);
                    }
                } else {
                    setAvatarUrl("");
                    setUnreadCount(0);
                }
            }

        };

        fetchAvatar();
    }, [isAuthenticated, user]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (action) => {
        handleClose();

        switch (action) {
            case 'login':
                router.push('/login');
                break;
            case 'signup':
                router.push('/signup');
                break;
            case 'profile':
                router.push(`/profile/${user?.pseudo || ''}`);
                break;
            case 'activity':
                router.push(`/activity`);
                break;
            case 'message':
                router.push('/message');
                break;
            case 'settings':
                router.push('/settings');
                break;
            case 'logout':
                handleLogout();
                break;
            default:
                break;
        }
    };

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
            console.error("Error during logout:", error);
        }
    };

    // Choix de l'avatar/icône à afficher en fonction de l'état d'authentification
    const renderUserIcon = () => {
        if (isAuthenticated && user) {
            // Si nous avons un utilisateur connecté avec un avatar, l'utiliser dans un Avatar
            if (avatarUrl) {
                return <Avatar src={avatarUrl} alt={user.pseudo}/>;
            }
            // Sinon, afficher la première lettre du pseudo dans un Avatar
            return <Avatar>{user.pseudo ? user.pseudo.charAt(0).toUpperCase() : 'U'}</Avatar>;
        }
        // Si aucun utilisateur n'est connecté, afficher simplement l'icône PersonIcon (pas d'Avatar)
        return <PersonIcon/>;
    };

    // Préparer le contenu du menu en fonction de l'état d'authentification
    const renderMenuContent = () => {
        if (isAuthenticated) {
            // Menu pour utilisateur connecté
            return [
                <Box key="user-info" sx={{py: 1.5, px: 2}}>
                    <Typography variant="subtitle1" noWrap fontWeight="bold">
                        {user?.pseudo || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {user?.email || ''}
                    </Typography>
                </Box>,
                <Divider key="divider-1" sx={{borderColor: 'rgba(255, 255, 255, 0.05)'}}/>,
                <MenuItem key="profile" onClick={() => handleMenuItemClick('profile')}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small"/>
                    </ListItemIcon>
                    Profile
                </MenuItem>,
                // Afficher l'élément de menu des messages uniquement pour les experts
                ...(user?.level === "expert" ? [
                    <MenuItem key="message" onClick={() => handleMenuItemClick('message')}>
                        <ListItemIcon>
                            <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                                <MessageIcon fontSize="small"/>
                            </Badge>
                        </ListItemIcon>
                        Messages
                    </MenuItem>
                ] : []),
                <MenuItem key="activity" onClick={() => handleMenuItemClick('activity')}>
                    <ListItemIcon>
                        <ActivityIcon fontSize="small"/>
                    </ListItemIcon>
                    Activity
                </MenuItem>,
                <MenuItem key="settings" onClick={() => handleMenuItemClick('settings')}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small"/>
                    </ListItemIcon>
                    Settings
                </MenuItem>,
                <Divider key="divider-2" sx={{borderColor: 'rgba(255, 255, 255, 0.05)'}}/>,
                <MenuItem key="logout" onClick={() => handleMenuItemClick('logout')}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small"/>
                    </ListItemIcon>
                    Logout
                </MenuItem>
            ];
        } else {
            // Menu pour visiteur non connecté
            return [
                <MenuItem key="login" onClick={() => handleMenuItemClick('login')}>
                    <ListItemIcon>
                        <LoginIcon fontSize="small"/>
                    </ListItemIcon>
                    Login
                </MenuItem>,
                <MenuItem key="signup" onClick={() => handleMenuItemClick('signup')}>
                    <ListItemIcon>
                        <PersonAddIcon fontSize="small"/>
                    </ListItemIcon>
                    Create Account
                </MenuItem>
            ];
        }
    };

    return (
        <Box>
            <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{
                    ml: 2,
                    border: isAuthenticated ? '2px solid rgba(25, 118, 210, 0.5)' : 'none',
                    bgcolor: isAuthenticated ? 'rgba(65, 105, 225, 0.2)' : 'transparent',
                    // Ajuster l'espacement et la taille de l'icône simple pour l'utilisateur non connecté
                    ...((!isAuthenticated) && {
                        p: '8px',
                        '& .MuiSvgIcon-root': {
                            fontSize: '1.3rem',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    })
                }}
            >
                {renderUserIcon()}
            </IconButton>
            <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'user-button',
                }}
                PaperProps={{
                    sx: {
                        width: isMobile ? '100%' : 320,
                        maxWidth: '100%',
                        mt: 1.5,
                        borderRadius: 0, // Style minimaliste avec bords droits
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                        ...(isMobile && {
                            left: '0 !important',
                            right: '0 !important',
                            borderRadius: '0', // Assurez-vous qu'il n'y a pas de border radius même en mobile
                        }),
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1.5,
                        },
                    },
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    backdrop: isMobile ? {
                        invisible: false,
                        sx: {backgroundColor: 'rgba(0, 0, 0, 0.5)'}
                    } : undefined
                }}
            >
                {renderMenuContent()}
            </Menu>
        </Box>
    );
} 