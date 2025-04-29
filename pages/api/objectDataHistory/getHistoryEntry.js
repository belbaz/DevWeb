// pages/api/objectDataHistory/getHistoryEntry.js

import { supabaseClient } from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Utilisateur non authentifié' });

    const { permissions } = getUserPermissions(user.points);
    if (!permissions.readData) {
        return res.status(403).json({ error: 'Accès refusé : lecture non autorisée' });
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Paramètre id requis' });
    }

    const { data, error } = await supabaseClient
        .from('ObjectDataHistory')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Erreur récupération entrée historique :', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération de l’entrée' });
    }

    return res.status(200).json({ historyEntry: data });
}
