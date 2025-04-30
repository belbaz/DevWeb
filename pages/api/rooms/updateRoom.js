import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// Handler pour traiter les requêtes PUT (mise à jour d’une pièce)
export default async function handler(req, res) {
    const { id } = req.query; // Récupération de l'ID de la pièce à modifier dans l'URL

    // Refuse toute méthode autre que PUT
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // Récupération de l'utilisateur à partir de la requête
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérification des permissions de mise à jour
        const { permissions } = getUserPermissions(user.points || 0);
        console.log("POINTS =", user.points);
        console.log("PERMISSIONS =", permissions);
        if (!permissions.updateObject) {
            return res.status(403).json({ error: 'Accès refusé : modification de pièce non autorisée' });
        }
        console.log("USER =", user);

        // Vérifie que l'ID est bien fourni
        if (!id) {
            return res.status(400).json({ error: 'ID de pièce manquant dans l’URL' });
        }

        // Récupère les champs à mettre à jour depuis le body
        const fieldsToUpdate = req.body;

        // Met à jour la pièce dans Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .update(fieldsToUpdate)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Erreur mise à jour pièce :', error);
            return res.status(500).json({
                error: 'Erreur Supabase',
                details: error.message,
            });
        }

        // Renvoie la pièce mise à jour
        return res.status(200).json({ updated: data });
    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
