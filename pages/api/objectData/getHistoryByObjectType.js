import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Accès refusé : lecture non autorisée' });
        }

        const { objectType } = req.query;
        if (!objectType) {
            return res.status(400).json({ error: 'Type d’objet manquant' });
        }

        const { data, error } = await supabaseClient
            .from('ObjectDataHistory')
            .select('*')
            .eq('type_Object', objectType)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Erreur Supabase :', error.message);
            return res.status(500).json({ error: 'Erreur récupération historique', details: error.message });
        }

        return res.status(200).json({ history: data });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
