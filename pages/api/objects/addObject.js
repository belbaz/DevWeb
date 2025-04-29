// pages/api/objects/addObject.js

import { supabaseClient } from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Utilisateur non authentifié' });

    const { permissions } = getUserPermissions(user.points);
    if (!permissions.addObject) {
        return res.status(403).json({ error: 'Accès refusé : vous ne pouvez pas ajouter d’objet' });
    }

    const { description, brand, type, room_id, accesLevel } = req.body;
    if (!description || !brand || !type || !room_id || !accesLevel) {
        return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const { data, error } = await supabaseClient
        .from('Object')
        .insert([{ description, brand, type, room_id, accesLevel }])
        .select()
        .single();

    if (error) return res.status(500).json({ error: 'Erreur ajout objet', details: error });
    return res.status(201).json({ object: data });
}
