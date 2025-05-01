/**
 * Mapping of level codes to display names
 */
export const levelMap = {
  'debutant': 'Beginner',
  'intermediaire': 'Intermediate',
  'avance': 'Advanced',
  'expert': 'Expert'
};

/**
 * Get the points value from a user object, handling different field names
 * @param {Object} user - The user object
 * @returns {number} - The points value
 */
export const getUserPoints = (user) => {
  if (!user) return 0;
  
  // Fonction pour convertir en nombre valide
  const toValidNumber = (value) => {
    if (value === undefined || value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };
  
  // Log pour déboguer les données utilisateur
  console.log('getUserPoints Debug:', {
    pointsss: user.pointsss,
    point: user.point,
    points: user.points,
    isObject: typeof user === 'object',
    keys: typeof user === 'object' ? Object.keys(user) : null
  });
  
  // PRIORITÉ 1: Récupérer depuis l'API checkUser qui expose 'point'
  let points = toValidNumber(user.point);
  if (points !== null) return points;
  
  // PRIORITÉ 2: Récupérer depuis la base de données qui utilise 'pointsss'
  points = toValidNumber(user.pointsss);
  if (points !== null) return points;
  
  // PRIORITÉ 3: Récupérer depuis getUserFromRequest qui expose 'points'
  points = toValidNumber(user.points);
  if (points !== null) return points;
  
  // Vérification dans user.user (structure imbriquée)
  if (user.user) {
    const userData = user.user;
    
    // Même priorité que ci-dessus
    points = toValidNumber(userData.point);
    if (points !== null) return points;
    
    points = toValidNumber(userData.pointsss);
    if (points !== null) return points;
    
    points = toValidNumber(userData.points);
    if (points !== null) return points;
  }
  
  // Vérification dans user.data (structure API)
  if (user.data) {
    const userData = user.data;
    
    // Même priorité que ci-dessus
    points = toValidNumber(userData.point);
    if (points !== null) return points;
    
    points = toValidNumber(userData.pointsss);
    if (points !== null) return points;
    
    points = toValidNumber(userData.points);
    if (points !== null) return points;
  }
  
  // Vérification dans d'autres structures possibles (récursive une fois)
  if (typeof user === 'object') {
    for (const key in user) {
      if (key === 'user' || key === 'data') continue; // Déjà traité ci-dessus
      
      const value = user[key];
      if (typeof value === 'object' && value !== null) {
        // Vérification dans l'objet imbriqué avec même priorité
        if (value.point !== undefined) {
          const num = toValidNumber(value.point);
          if (num !== null) return num;
        }
        
        if (value.pointsss !== undefined) {
          const num = toValidNumber(value.pointsss);
          if (num !== null) return num;
        }
        
        if (value.points !== undefined) {
          const num = toValidNumber(value.points);
          if (num !== null) return num;
        }
      }
    }
  }
  
  // Consigne au développeur pour le débogage
  console.warn('No points found in user object:', user);
  return 0;
};

/**
 * Calculate the user level based on points
 * @param {number} points - The user's points
 * @returns {string} The user level code
 */
export const getUserLevel = (points) => {
  if (typeof points === 'object') {
    points = getUserPoints(points);
  }
  
  points = Number(points) || 0;
  
  if (points < 250) return 'debutant';
  if (points < 1000) return 'intermediaire';
  if (points < 2000) return 'avance';
  return 'expert';
};

/**
 * Calculate the user's progress information including next level and progress percentage
 * @param {number|Object} points - The user's points or user object
 * @returns {Object} Progress information object
 */
export const calculateProgress = (points) => {
  // Assurer que nous avons un nombre de points valide
  if (typeof points === 'object') {
    points = getUserPoints(points);
  }
  
  points = Number(points) || 0;
  
  if (points < 250) {
    return {
      level: 'debutant',
      nextLevel: 'intermediaire',
      progress: (points / 250) * 100,
      pointsNeeded: 250 - points
    };
  } else if (points < 1000) {
    return {
      level: 'intermediaire',
      nextLevel: 'avance',
      progress: ((points - 250) / 750) * 100,
      pointsNeeded: 1000 - points
    };
  } else if (points < 2000) {
    return {
      level: 'avance',
      nextLevel: 'expert',
      progress: ((points - 1000) / 1000) * 100,
      pointsNeeded: 2000 - points
    };
  } else {
    return {
      level: 'expert',
      nextLevel: null,
      progress: 100,
      pointsNeeded: 0
    };
  }
}; 