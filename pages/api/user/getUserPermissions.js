import { getUserPermissions } from 'lib/getUserPermissions.js';

export default async function handler(req, res) {
    // Vérifie que la méthode est bien GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Récupère les points depuis la requête
        const points = parseInt(req.query.points) || 0;
        
        // Utilise la fonction existante pour obtenir le niveau et les permissions
        const { level, permissions } = getUserPermissions(points);
        
        // Retourne les données
        return res.status(200).json({ 
            level,
            permissions 
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
} 