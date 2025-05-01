/**
 * Utilitaires pour gérer les points des utilisateurs
 */
import supabase from './supabaseClient';
import { getUserPoints } from './userLevelUtils';

/**
 * Ajoute des points à un utilisateur
 * @param {string} username - Pseudo de l'utilisateur
 * @param {number} pointsToAdd - Nombre de points à ajouter
 * @param {string} reason - Raison de l'ajout des points (pour le log)
 * @returns {Promise<{success: boolean, previousPoints: number, newPoints: number}>} Résultat de l'opération
 */
export const addUserPoints = async (username, pointsToAdd, reason = 'unknown') => {
  try {
    if (!username || !pointsToAdd || isNaN(pointsToAdd)) {
      console.error('Invalid parameters for addUserPoints', { username, pointsToAdd });
      return { success: false, error: 'Invalid parameters' };
    }

    // Récupérer les points actuels
    const { data: userData, error: fetchError } = await supabase
      .from('User')
      .select('pointsss')
      .eq('pseudo', username)
      .single();

    if (fetchError) {
      console.error('Error fetching user points:', fetchError);
      return { success: false, error: 'Error fetching user data' };
    }

    const currentPoints = userData.pointsss || 0;
    const newPoints = Math.max(0, currentPoints + pointsToAdd); // Jamais négatif

    // Mettre à jour les points
    const { error: updateError } = await supabase
      .from('User')
      .update({ pointsss: newPoints })
      .eq('pseudo', username);

    if (updateError) {
      console.error('Error updating user points:', updateError);
      return { success: false, error: 'Error updating points' };
    }

    console.log(`Added ${pointsToAdd} points to user ${username} for ${reason}. New total: ${newPoints}`);
    
    return {
      success: true,
      previousPoints: currentPoints,
      newPoints: newPoints,
      pointsAdded: pointsToAdd
    };
  } catch (error) {
    console.error('Error in addUserPoints:', error);
    return { success: false, error: 'Unexpected error' };
  }
};

/**
 * Vérifie si c'est la première connexion du jour pour l'utilisateur et ajoute des points si nécessaire
 * @param {string} username - Pseudo de l'utilisateur
 * @returns {Promise<{success: boolean, isFirstLogin: boolean, pointsAdded: number}>} Résultat de l'opération
 */
export const handleDailyLogin = async (username) => {
  try {
    if (!username) {
      return { success: false, error: 'Invalid username' };
    }

    // Récupérer la dernière connexion
    const { data: userData, error: fetchError } = await supabase
      .from('User')
      .select('lastLogin, pointsss')
      .eq('pseudo', username)
      .single();

    if (fetchError) {
      console.error('Error fetching user data for daily login:', fetchError);
      return { success: false, error: 'Error fetching user data' };
    }

    const now = new Date();
    const lastLogin = userData.lastLogin ? new Date(userData.lastLogin) : null;
    
    // Vérifier si c'est la première connexion du jour
    const isNewDay = !lastLogin || 
      (now.getDate() !== lastLogin.getDate() || 
       now.getMonth() !== lastLogin.getMonth() || 
       now.getFullYear() !== lastLogin.getFullYear());
    
    // Mettre à jour la date de dernière connexion dans tous les cas
    const { error: updateError } = await supabase
      .from('User')
      .update({ lastLogin: now.toISOString() })
      .eq('pseudo', username);

    if (updateError) {
      console.error('Error updating last login date:', updateError);
      return { success: false, error: 'Error updating login date' };
    }
    
    // Si c'est une nouvelle journée, ajouter des points
    if (isNewDay) {
      const pointsToAdd = 5; // Points pour connexion quotidienne
      const result = await addUserPoints(username, pointsToAdd, 'daily login');
      
      return {
        success: result.success,
        isFirstLogin: true,
        pointsAdded: pointsToAdd,
        newPoints: result.newPoints
      };
    }
    
    return {
      success: true,
      isFirstLogin: false,
      pointsAdded: 0,
      points: userData.pointsss || 0
    };
  } catch (error) {
    console.error('Error handling daily login:', error);
    return { success: false, error: 'Unexpected error' };
  }
}; 