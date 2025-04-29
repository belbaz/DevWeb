import supabaseClient from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

export default async function handler(req, res) {
    // Refus si la méthode n’est pas GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // Récupération de l’utilisateur depuis la requête
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérification des permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Accès refusé : lecture des objets non autorisée' });
        }

        // Lecture des objets dans la base Supabase
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*');

        // Erreur côté Supabase
        if (error) {
            console.error('Erreur Supabase :', error.message);
            return res.status(500).json({
                error: 'Erreur lors de la récupération des objets',
                details: error.message,
            });
        }

        // On renvoie les objets récupérés
        return res.status(200).json({ objects: data });

    } catch (err) {
        // Erreurs serveur
        console.error('Erreur serveur :', err);
        return res.status(500).json({
            error: 'Erreur serveur inattendue',
            details: err.message,
        });
    }
}
