// pages/api/objects/updateObject.js

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
    if (!permissions.addObject) {
        return res.status(403).json({ error: 'Accès refusé : droits insuffisants pour modifier un objet' });
    }

    const { id, description, brand, type, room_id, accesLevel } = req.body;
    if (!id || !description || !brand || !type || !room_id || !accesLevel) {
        return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const { data, error } = await supabaseClient
        .from('Object')
        .update({ description, brand, type, room_id, accesLevel })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erreur modification objet :', error);
        return res.status(500).json({ error: 'Erreur lors de la modification de l’objet' });
    }

    return res.status(200).json({ object: data });
}
