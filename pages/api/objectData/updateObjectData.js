// pages/api/objectData/updateObjectData.js

import { supabaseClient } from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Utilisateur non authentifié' });

    const { permissions } = getUserPermissions(user.points);
    if (!permissions.addData) {
        return res.status(403).json({ error: 'Accès refusé : modification non autorisée' });
    }

    const { id, data: newData } = req.body;
    if (!id || !newData) {
        return res.status(400).json({ error: 'ID ou données manquantes' });
    }

    const { data, error } = await supabaseClient
        .from('ObjectData')
        .update({ data: newData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erreur modification ObjectData :', error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour des données' });
    }

    return res.status(200).json({ updatedData: data });
}
