import { supabaseClient } from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Authentification utilisateur
    const user = await getUserFromRequest(req);

    if (!user) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Supposons que user.points est directement disponible
    const { permissions } = getUserPermissions(user.points);

    // Vérification d'autorisation
    if (!permissions.readObject) {
        return res.status(403).json({ error: 'Accès interdit : permissions insuffisantes' });
    }

    // Si autorisé, récupérer les rooms
    const { data, error } = await supabaseClient
        .from('Room')
        .select('*');

    if (error) {
        console.error('Erreur Supabase:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des rooms' });
    }

    return res.status(200).json({ rooms: data });
}
