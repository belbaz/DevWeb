/**
 * Utilitaires pour gérer les points des utilisateurs
 */
import supabase from './supabaseClient';
import { getUserPoints } from './userLevelUtils';

/**
 * Détermine le niveau en fonction des points
 * @param {number} points - Nombre de points
 * @returns {string} Niveau correspondant
 */
export const calculateLevelFromPoints = (points) => {
  if (points < 250) return 'beginner';
  if (points < 1000) return 'intermediate';
  if (points < 2000) return 'advanced';
  return 'expert';
};

/**
 * Met à jour le niveau d'un utilisateur en fonction de ses points
 * @param {string} username - Pseudo de l'utilisateur
 * @param {number} points - Nombre de points actuels
 * @returns {Promise<{success: boolean, previousLevel: string, newLevel: string}>} Résultat de l'opération
 */
export const updateUserLevel = async (username, points) => {
  try {
    // Récupérer le niveau actuel
    const { data: userData, error: fetchError } = await supabase
      .from('User')
      .select('level')
      .eq('pseudo', username)
      .single();

    if (fetchError) {
      console.error('Error fetching user level:', fetchError);
      return { success: false, error: 'Error fetching user level' };
    }

    const previousLevel = userData.level || 'beginner';
    const newLevel = calculateLevelFromPoints(points);

    // Si le niveau n'a pas changé, pas besoin de mise à jour
    if (previousLevel === newLevel) {
      return { success: true, levelChanged: false, level: newLevel };
    }

    // Mettre à jour le niveau
    const { error: updateError } = await supabase
      .from('User')
      .update({ level: newLevel })
      .eq('pseudo', username);

    if (updateError) {
      console.error('Error updating user level:', updateError);
      return { success: false, error: 'Error updating level' };
    }

    console.log(`User ${username} level updated from ${previousLevel} to ${newLevel}`);

    return {
      success: true,
      levelChanged: true,
      previousLevel,
      newLevel
    };
  } catch (error) {
    console.error('Error in updateUserLevel:', error);
    return { success: false, error: 'Unexpected error' };
  }
};

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
      .select('points')
      .eq('pseudo', username)
      .single();

    if (fetchError) {
      console.error('Error fetching user points:', fetchError);
      return { success: false, error: 'Error fetching user data' };
    }

    const currentPoints = userData.points || 0;
    const newPoints = Math.max(0, currentPoints + pointsToAdd); // Jamais négatif

    // Mettre à jour les points
    const { error: updateError } = await supabase
      .from('User')
      .update({ points: newPoints })
      .eq('pseudo', username);

    if (updateError) {
      console.error('Error updating user points:', updateError);
      return { success: false, error: 'Error updating points' };
    }

    // Mettre à jour le niveau si nécessaire
    const levelResult = await updateUserLevel(username, newPoints);

    console.log(`Added ${pointsToAdd} points to user ${username} for ${reason}. New total: ${newPoints}`);
    if (levelResult.levelChanged) {
      console.log(`User ${username} leveled up from ${levelResult.previousLevel} to ${levelResult.newLevel}!`);
    }

    return {
      success: true,
      previousPoints: currentPoints,
      newPoints: newPoints,
      pointsAdded: pointsToAdd,
      levelUp: levelResult.levelChanged,
      newLevel: levelResult.newLevel
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
      .select('lastLogin, points')
      .eq('pseudo', username)
      .single();

    if (fetchError || !userData) {
      console.error('Error fetching user data for daily login:', fetchError);
      return { success: false, error: 'Error fetching user data' };
    }

    // Utiliser moment.js avec le fuseau horaire Europe/Paris comme dans l'implémentation originale
    const moment = (await import('moment-timezone')).default;
    const now = moment().tz('Europe/Paris');
    const lastLogin = userData.lastLogin ? moment(userData.lastLogin).tz('Europe/Paris') : null;

    // Vérifier si c'est la première connexion du jour (en utilisant la méthode moment.js)
    const isNewDay = !lastLogin || !now.isSame(lastLogin, 'day');

    // Mettre à jour la date de dernière connexion dans tous les cas
    // Utiliser le même format que dans l'implémentation originale
    const { error: updateError } = await supabase
      .from('User')
      .update({ lastLogin: now.format() })
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
        newPoints: result.newPoints,
        levelUp: result.levelUp,
        newLevel: result.newLevel
      };
    }

    return {
      success: true,
      isFirstLogin: false,
      pointsAdded: 0,
      points: userData.points || 0
    };
  } catch (error) {
    console.error('Error handling daily login:', error);
    return { success: false, error: 'Unexpected error' };
  }
}; 