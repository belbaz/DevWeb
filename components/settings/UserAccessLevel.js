"use client";

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, CircularProgress, Tooltip } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

// Définition du dictionnaire de traduction des niveaux
const levelMap = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert'
};

// Fonction pour récupérer les points de l'utilisateur
const getUserPoints = (user) => {
  return user?.points || 0;
};

// Fonction pour obtenir le niveau de l'utilisateur
const getUserLevel = (user) => {
  const points = getUserPoints(user);
  if (points >= 2000) return "expert";
  if (points >= 1000) return "advanced";
  if (points >= 250) return "intermediate";
  return "beginner";
};

// Fonction pour calculer la progression de l'utilisateur
const calculateProgress = (user) => {
  const points = getUserPoints(user);
  const currentLevel = user?.level || getUserLevel(user);
  
  let nextLevel = null;
  let pointsNeeded = 0;
  let progress = 100;
  
  // Calculer le niveau suivant et les points nécessaires
  if (currentLevel === 'beginner') {
    nextLevel = 'intermediate';
    pointsNeeded = 250 - points;
    progress = (points / 250) * 100;
  } else if (currentLevel === 'intermediate') {
    nextLevel = 'advanced';
    pointsNeeded = 1000 - points;
    progress = ((points - 250) / 750) * 100;
  } else if (currentLevel === 'advanced') {
    nextLevel = 'expert';
    pointsNeeded = 2000 - points;
    progress = ((points - 1000) / 1000) * 100;
  } else {
    // Déjà expert
    nextLevel = null;
    pointsNeeded = 0;
    progress = 100;
  }
  
  return {
    level: currentLevel,
    nextLevel,
    pointsNeeded,
    progress: Math.min(Math.max(progress, 0), 100) // Limiter entre 0 et 100
  };
};

const UserAccessLevel = ({ userData }) => {
  const [accessLevelStats, setAccessLevelStats] = useState({
    byAccessLevel: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
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
          beginner: 0,
          intermediate: 0,
          advanced: 0,
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
    <div style={{ width: '100%', maxWidth: '100%' }}>
      <h2 className="card-title">Access Level</h2>
      
      <div className="permissions-level-info">
        Your current level is: <strong>{levelMap[userLevel] || 'Unknown'}</strong> ({userPoints} points)
      </div>
      
      <div className="progress-container">
        <div className="progress-info">
          <span>{levelMap[userLevel] || userLevel}</span>
            {progressInfo.nextLevel && (
            <span>{levelMap[progressInfo.nextLevel] || progressInfo.nextLevel}</span>
            )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ 
                width: `${progressInfo.progress}%`,
              background: 'primary.main'
            }}
          ></div>
        </div>
      </div>
      
      <div className="permissions-footer">
        <p className="permissions-info-text">
          As you collect more points, you'll unlock additional features. 
          Keep exploring the museum to gain points and advance to the next level.
        </p>
      </div>
    </div>
  );
};

export default UserAccessLevel; 