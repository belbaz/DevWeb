import { getUserPermissions } from 'lib/getUserPermissions.js';

export default async function handler(req, res) {
    // Vérifie que la méthode est bien GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Priorité au niveau de la DB s'il est fourni
        const userLevel = req.query.level;
        let level, permissions;

        if (userLevel) {
            // Si le niveau est fourni directement, l'utiliser au lieu de le calculer
            // et récupérer directement les permissions associées
            ({ permissions } = getUserPermissionsByLevel(userLevel));
            level = userLevel;
        } else {
            // Rétrocompatibilité: utiliser les points pour calculer le niveau et les permissions
            const points = parseInt(req.query.points) || 0;
            ({ level, permissions } = getUserPermissions(points));
        }

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

// Nouvelle fonction qui retourne les permissions directement par niveau
function getUserPermissionsByLevel(level) {
    let permissions = {
        readObject: false,
        readData: false,
        readRoom: false,
        updateObject: false,
        updateData: false,
        updateRoom: false,
        addObject: false,
        addData: false,
        addRoom: false,
        deleteObject: false,
        deleteData: false,
        deleteRoom: false,
    };

    switch (level) {
        case 'beginner':
            permissions.readObject = true;
            permissions.readRoom = true;
            break;
        case 'intermediate':
            permissions.readObject = true;
            permissions.readData = true;
            permissions.readRoom = true;
            permissions.updateRoom = true;
            permissions.addData = true;
            break;
        case 'advanced':
            permissions.readObject = true;
            permissions.readData = true;
            permissions.readRoom = true;
            permissions.addData = true;
            permissions.deleteData = true;
            permissions.updateRoom = true;
            permissions.updateObject = true;
            permissions.updateData = true;
            break;
        case 'expert':
            permissions.readObject = true;
            permissions.readData = true;
            permissions.readRoom = true;
            permissions.addData = true;
            permissions.addObject = true;
            permissions.addRoom = true;
            permissions.deleteObject = true;
            permissions.deleteData = true;
            permissions.deleteRoom = true;
            permissions.updateObject = true;
            permissions.updateData = true;
            permissions.updateRoom = true;
            break;
        default:
            // Pour tout autre niveau ou cas inconnu, permissions minimales
            permissions.readObject = true;
            permissions.readRoom = true;
    }

    return { permissions };
} 