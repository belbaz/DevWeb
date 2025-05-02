"use client";

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, CircularProgress, Tooltip } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { calculateProgress, getUserLevel, levelMap, getUserPoints } from '../../lib/userLevelUtils';

const UserAccessLevel = ({ userData }) => {
  const [accessLevelStats, setAccessLevelStats] = useState({
    byAccessLevel: {
      debutant: 0,
      intermediaire: 0,
      avance: 0,
      expert: 0
    }
  });
  
  // Debug: Affichons les données utilisateur
  useEffect(() => {
    if (userData) {
      console.log("UserAccessLevel - Données utilisateur:", {
        userData,
        points: userData.points,
        level: userData.level,
        calculatedPoints: getUserPoints(userData)
      });
    }
  }, [userData]);
  
  // Récupération des points avec la fonction améliorée
  const userPoints = getUserPoints(userData);

  useEffect(() => {
    // Calculate the access level stats based on user data
    if (userData) {
      const userLevel = userData.level || getUserLevel(userData);
      const stats = {
        byAccessLevel: {
          debutant: 0,
          intermediaire: 0,
          avance: 0,
          expert: 0
        }
      };
      
      // Mark current level with 1
      if (stats.byAccessLevel[userLevel] !== undefined) {
        stats.byAccessLevel[userLevel] = 1;
      }
      
      setAccessLevelStats(stats);
    }
  }, [userData]);

  // Safely prepare chart data for access levels
  const prepareAccessLevelChartData = () => {
    try {
      if (!accessLevelStats || !accessLevelStats.byAccessLevel) {
        return { data: [], labels: [] };
      }
      
      const accessLevels = Object.keys(accessLevelStats.byAccessLevel);
      const counts = Object.values(accessLevelStats.byAccessLevel);
      
      if (accessLevels.length === 0 || counts.some(isNaN)) {
        return { data: [], labels: [] };
      }
      
      return {
        data: counts,
        labels: accessLevels.map(level => levelMap[level] || level.charAt(0).toUpperCase() + level.slice(1))
      };
    } catch (error) {
      console.error('Error preparing access level chart data:', error);
      return { data: [], labels: [] };
    }
  };

  const canRenderBarChart = (data, labels) => {
    return Array.isArray(data) && data.length > 0 && 
           Array.isArray(labels) && labels.length > 0 &&
           data.length === labels.length &&
           data.every(value => typeof value === 'number');
  };

  const { data: accessLevelData, labels: accessLevelLabels } = prepareAccessLevelChartData();
  const progressInfo = calculateProgress(userData);
  
  // Obtenir le niveau utilisateur directement de la base de données
  const userLevel = userData?.level || (progressInfo ? progressInfo.level : null);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>User Access Level</Typography>
      
      {/* User Level Summary */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" align="center">{userPoints}</Typography>
              <Typography variant="body2" align="center">Total Points</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" align="center">{levelMap[userLevel] || 'Unknown'}</Typography>
              <Typography variant="body2" align="center">Current Level</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" align="center">
                {progressInfo.nextLevel ? progressInfo.pointsNeeded : 'MAX'}
              </Typography>
              <Typography variant="body2" align="center">
                {progressInfo.nextLevel ? 'Points to Next Level' : 'Level Reached'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Level Progress</Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">
              {levelMap[userLevel] || userLevel}
            </Typography>
            {progressInfo.nextLevel && (
              <Typography variant="body2">
                {levelMap[progressInfo.nextLevel] || progressInfo.nextLevel}
              </Typography>
            )}
          </Box>
          <Box sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1, height: 10, overflow: 'hidden' }}>
            <Box
              sx={{
                width: `${progressInfo.progress}%`,
                bgcolor: 'primary.main',
                height: '100%',
                transition: 'width 0.5s ease-in-out'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption">
              {userPoints} points
            </Typography>
            {progressInfo.nextLevel && (
              <Typography variant="caption">
                {progressInfo.nextLevel === 'intermediaire' ? '250 points' : 
                 progressInfo.nextLevel === 'avance' ? '1000 points' : 
                 '2000 points'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Nouvelle jauge pour progression globale jusqu'à 2500 points */}
        {userPoints >= 250 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Global Progress (to 2500 points)</Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Intermediate</Typography>
                <Typography variant="body2">Master Expert</Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1, height: 10, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${Math.min(100, (userPoints / 2500) * 100)}%`,
                    bgcolor: 'secondary.main',
                    height: '100%',
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption">250 points</Typography>
                <Typography variant="caption">2500 points</Typography>
              </Box>
              
              {/* Points intermédiaires pour référence */}
              <Box sx={{ position: 'relative', mt: 1, height: 16 }}>
                <Box sx={{ 
                  position: 'absolute', 
                  left: '10%', 
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Box sx={{ width: 1, height: 6, bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem' }}>250</Typography>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  left: '40%', 
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Box sx={{ width: 1, height: 6, bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem' }}>1000</Typography>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  left: '80%', 
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Box sx={{ width: 1, height: 6, bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem' }}>2000</Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {userPoints} / 2500 points ({Math.round((userPoints / 2500) * 100)}%)
                </Typography>
                {userPoints >= 2500 ? (
                  <Typography variant="caption" sx={{ display: 'block', color: 'success.main', mt: 0.5 }}>
                    Maximum points achieved! Master Expert level.
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.5)', mt: 0.5 }}>
                    {2500 - userPoints} more points to reach Master Expert level.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Level Benefits */}
      <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Level Benefits</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Beginner</Typography>
              <Typography variant="body2" gutterBottom>0-249 points</Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li"><Typography variant="body2">Basic access to the platform</Typography></Box>
                <Box component="li"><Typography variant="body2">Use basic objects and functions</Typography></Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Intermediate</Typography>
              <Typography variant="body2" gutterBottom>250-999 points</Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li"><Typography variant="body2">Create custom objects</Typography></Box>
                <Box component="li"><Typography variant="body2">Save templates</Typography></Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Advanced</Typography>
              <Typography variant="body2" gutterBottom>1000-1999 points</Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li"><Typography variant="body2">Create complex room configurations</Typography></Box>
                <Box component="li"><Typography variant="body2">Share objects with other users</Typography></Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Expert</Typography>
              <Typography variant="body2" gutterBottom>2000+ points</Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li"><Typography variant="body2">Full platform access</Typography></Box>
                <Box component="li"><Typography variant="body2">Create and manage advanced automation</Typography></Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* How to Earn Points */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>How to Earn Points</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              p: 1, 
              borderLeft: '3px solid', 
              borderColor: 'primary.main',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}>
              <Typography variant="body2" noWrap>Creating objects</Typography>
              <Typography variant="h6">+10 points</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              p: 1, 
              borderLeft: '3px solid', 
              borderColor: 'secondary.main',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}>
              <Typography variant="body2" noWrap>Daily login</Typography>
              <Typography variant="h6">+5 points</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              p: 1, 
              borderLeft: '3px solid', 
              borderColor: 'success.main',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}>
              <Typography variant="body2" noWrap>Creating rooms</Typography>
              <Typography variant="h6">+15 points</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              p: 1, 
              borderLeft: '3px solid', 
              borderColor: 'warning.main',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}>
              <Typography variant="body2" noWrap>Completing challenges</Typography>
              <Typography variant="h6">+25 points</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserAccessLevel; 