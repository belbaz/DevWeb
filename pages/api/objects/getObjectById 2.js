import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RENVOIE QU'UN SEUL OBJET EN FONCTION DE SON ID

// Fonction handler pour traiter une requête GET
export default async function handler(req, res) {
    // Vérifie que la méthode est bien GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID de l\'objet manquant' });
    }

    try {
        // Récupère l'utilisateur
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifie les permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Accès refusé : lecture non autorisée' });
        }

        // Requête Supabase
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erreur Supabase :', error.message);
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Objet non trouvé' });
            }
            return res.status(500).json({
                error: 'Erreur lors de la récupération de l\'objet',
                details: error.message,
            });
        }

        return res.status(200).json({ object: data });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
