import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RENVOIE LA LISTE DES PIÈCES (ROOMS) AVEC FILTRES OPTIONNELS
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Accès refusé : lecture des pièces non autorisée' });
        }

        // Filtres optionnels depuis l’URL
        const { floor, roomtype, levelAcces } = req.query;

        let query = supabaseClient.from('Room').select('*');

        if (floor !== undefined) {
            const parsedFloor = parseInt(floor, 10);
            if (!isNaN(parsedFloor)) {
                query = query.eq('floor', parsedFloor);
            }
        }

        if (roomtype) {
            query = query.ilike('roomtype', `%${roomtype}%`);
        }

        if (levelAcces) {
            query = query.eq('levelAcces', levelAcces);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erreur Supabase :', error.message);
            return res.status(500).json({
                error: 'Erreur lors de la récupération des pièces',
                details: error.message,
            });
        }

        return res.status(200).json({ rooms: data });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({
            error: 'Erreur serveur inattendue',
            details: err.message,
        });
    }
}
