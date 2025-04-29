import supabaseClient from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

// RENVOIE UNE INSTANCE DE DONNÉES OBJECTDATA PAR ID

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
        if (!permissions.readData) {
            return res.status(403).json({ error: 'Accès refusé : lecture non autorisée' });
        }

        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'ID de l’instance manquant dans la requête' });
        }

        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erreur Supabase :', error.message);
            return res.status(500).json({
                error: 'Erreur lors de la récupération de l’instance',
                details: error.message,
            });
        }

        // Vérifie que le champ "data" est bien un objet JSON
        if (typeof data.data !== 'object') {
            return res.status(500).json({ error: 'Le champ "data" ne contient pas un objet JSON valide' });
        }

        return res.status(200).json({ instance: data });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
