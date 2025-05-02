"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { calculateProgress, levelMap, getUserPoints } from '../../lib/userLevelUtils';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

const UserProfileCard = ({ user }) => {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  
  // Récupération des points avec console.log pour debugging
  const userPoints = getUserPoints(user);
  useEffect(() => {
    // Debug: Affichez les données pour vérifier où se trouvent les points
    if (user) {
      console.log("User data in UserProfileCard:", {
        points: user.points,
        calculatedPoints: userPoints
      });
    }
  }, [user, userPoints]);
  
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

  const progressInfo = calculateProgress(user);

  return (
    <Paper sx={{ 
      p: 3, 
      height: '100%',
      bgcolor: 'rgba(0, 0, 0, 0.8)', 
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mb: 3
      }}>
        {isAvatarLoaded ? (
          <Avatar 
            src={avatarUrl} 
            alt={user.pseudo}
            sx={{ width: 96, height: 96, mb: 2 }}
          />
        ) : (
          <Skeleton 
            variant="circular" 
            width={96} 
            height={96} 
            sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} 
          />
        )}
        
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {user.pseudo}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip 
            icon={<PersonIcon fontSize="small" />} 
            label={levelMap[progressInfo.level] || progressInfo.level} 
            color="primary" 
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
          <Chip 
            icon={<LockIcon fontSize="small" />} 
            label={user.role} 
            color="secondary" 
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        </Stack>
      </Box>

      <Box sx={{ mb: 3, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
          Points: {userPoints}
        </Typography>
        
        {progressInfo.nextLevel && (
          <>
            <LinearProgress 
              variant="determinate" 
              value={progressInfo.progress} 
              sx={{ height: 8, borderRadius: 1, mb: 1 }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {progressInfo.pointsNeeded} points needed for {levelMap[progressInfo.nextLevel] || progressInfo.nextLevel} level
            </Typography>
          </>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Account Details</Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto 1fr', 
            gap: '8px 16px',
            '& > :nth-of-type(odd)': { 
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 'bold'
            }
          }}>
            <Typography variant="body2">Name:</Typography>
            <Typography variant="body2">{user.name || '-'} {user.lastName || ''}</Typography>
            
            <Typography variant="body2">Email:</Typography>
            <Typography variant="body2">{user.email || '-'}</Typography>
            
            <Typography variant="body2">Role:</Typography>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{user.role || '-'}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Button 
          fullWidth 
          variant="outlined" 
          onClick={() => router.push('/settings')}
          sx={{ mb: 1 }}
        >
          Settings
        </Button>
        <Button 
          fullWidth 
          variant="contained" 
          color="error" 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Paper>
  );
};

export default UserProfileCard; 