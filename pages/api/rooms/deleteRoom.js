import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// Handler pour traiter une requête DELETE (suppression d’une pièce)
export default async function handler(req, res) {
    const { id } = req.query; // Récupération de l'ID de la pièce à supprimer

    // Refuse toute méthode autre que DELETE
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Vérifie que l'ID est présent
    if (!id) {
        return res.status(400).json({ error: 'ID de pièce manquant dans l’URL' });
    }

    try {
        // Récupération de l'utilisateur à partir de la requête
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifie si l'utilisateur a la permission de supprimer une pièce
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Accès refusé : suppression de pièce non autorisée' });
        }

        // Supprime la pièce correspondante dans Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Erreur suppression pièce :', error);
            return res.status(500).json({
                error: 'Erreur Supabase',
                details: error.message,
            });
        }

        // Renvoie la pièce supprimée
        return res.status(200).json({ deleted: data });
    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
