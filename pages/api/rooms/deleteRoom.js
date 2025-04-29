// pages/api/rooms/deleteRoom.js

import { supabaseClient } from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const user = await getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const { permissions } = getUserPermissions(user.points);
    if (!permissions.deleteObject) {
        return res.status(403).json({ error: 'Accès refusé : droits insuffisants pour supprimer une room' });
    }

    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID requis' });
    }

    const { error } = await supabaseClient
        .from('Room')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erreur suppression room :', error);
        return res.status(500).json({ error: 'Erreur lors de la suppression de la room' });
    }

    return res.status(200).json({ message: 'Room supprimée avec succès' });
}
