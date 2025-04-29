// pages/api/objects/getObject.js

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
    if (!permissions.readObject) {
        return res.status(403).json({ error: 'Accès refusé : lecture des objets non autorisée' });
    }

    const { data, error } = await supabaseClient
        .from('Object')
        .select('*');

    if (error) {
        console.error('Erreur récupération objets :', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des objets' });
    }

    return res.status(200).json({ objects: data });
}
