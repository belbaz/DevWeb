import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RENVOIE QU'UN SEUL OBJET EN FONCTION DE SON ID

// Fonction handler pour traiter une requête GET
export default async function handler(req, res) {
    // Refuse toute méthode autre que GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // Récupère l'utilisateur à partir de la requête
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifie si l'utilisateur a le droit de lire un objet
        const { permissions } = getUserPermissions(user.pointsss || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Accès refusé : lecture non autorisée' });
        }

        // Vérifie que l'ID de l'objet est bien présent dans la requête
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'ID manquant dans la requête' });
        }

        // Récupère l'objet correspondant dans la base de données Supabase
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*')
            .eq('id', id)
            .single();

        // Gestion des erreurs Supabase
        if (error) {
            console.error('Erreur Supabase :', error.message);
            return res.status(500).json({ error: 'Erreur lors de la récupération', details: error.message });
        }

        // Renvoie l'objet trouvé
        return res.status(200).json({ object: data });

    } catch (err) {
        // Gestion des erreurs générales
        console.error('Erreur serveur :', err.message);
        return res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
}
