import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RENVOIE UNE PIÈCE SPÉCIFIQUE SELON SON ID
export default async function handler(req, res) {
    // Refus si la méthode n’est pas GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
    console.log("test")
    try {
        // Récupération de l’utilisateur
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérification des permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Accès refusé : lecture des pièces non autorisée' });
        }

        // Vérification de la présence et validité de l’ID
        const { id } = req.query;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'ID de pièce invalide ou manquant dans la requête' });
        }

        // Lecture de la pièce correspondante
        const { data, error } = await supabaseClient
            .from('Room')
            .select('*')
            .eq('id', parsedId)
            .single();

        if (error) {
            console.error('Erreur Supabase :', error.message);
            return res.status(500).json({
                error: 'Erreur lors de la récupération de la pièce',
                details: error.message,
            });
        }

        return res.status(200).json({ room: data });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({
            error: 'Erreur serveur inattendue',
            details: err.message,
        });
    }
}
