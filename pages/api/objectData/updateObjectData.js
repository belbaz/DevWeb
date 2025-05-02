import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.updateData) {
            return res.status(403).json({ error: 'Accès refusé : modification des données non autorisée' });
        }

        if (!id) {
            return res.status(400).json({ error: 'ID manquant dans l’URL' });
        }

        const { data: jsonData } = req.body;

        if (!jsonData || typeof jsonData !== 'object') {
            return res.status(400).json({ error: 'Données JSON manquantes ou invalides' });
        }

        const { data, error } = await supabaseClient
            .from('ObjectData')
            .update({ data: jsonData })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Erreur mise à jour ObjectData :', error);
            return res.status(500).json({
                error: 'Erreur Supabase',
                details: error.message,
            });
        }

        return res.status(200).json({ updated: data });
    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
