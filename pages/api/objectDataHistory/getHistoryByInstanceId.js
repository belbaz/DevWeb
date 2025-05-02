// pages/api/objectDataHistory/getHistoryByInstance.js

import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Utilisateur non authentifié' });

    const { permissions } = getUserPermissions(user.points);
    if (!permissions.readData) {
        return res.status(403).json({ error: 'Accès refusé : lecture de l’historique non autorisée' });
    }

    const { object_data_id } = req.query;
    if (!object_data_id) {
        return res.status(400).json({ error: 'Paramètre object_data_id requis' });
    }

    const { data, error } = await supabaseClient
        .from('ObjectDataHistory')
        .select('*')
        .eq('object_data_id', object_data_id)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Erreur récupération historique :', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération de l’historique' });
    }

    return res.status(200).json({ history: data });
}
