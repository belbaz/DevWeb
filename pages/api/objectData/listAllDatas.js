import supabaseClient from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

// RENVOIE LA LISTE DE TOUTES LES INSTANCES DE DONNÉES (ObjectData)

export default async function handler(req, res) {
    // Vérifie que la méthode est bien GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // Récupère l'utilisateur
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifie les permissions de lecture
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readData) {
            return res.status(403).json({ error: 'Accès refusé : lecture non autorisée' });
        }

        // Requête Supabase pour récupérer toutes les données
        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select('*');

        if (error) {
            console.error('Erreur Supabase :', error.message);
            return res.status(500).json({
                error: 'Erreur lors de la récupération des données',
                details: error.message,
            });
        }

        return res.status(200).json({ objectData: data });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
