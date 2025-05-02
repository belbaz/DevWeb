import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import {logAction} from "lib/logAction";

// Handler pour traiter une requête DELETE (suppression d’un objet)
export default async function handler(req, res) {
    const { id } = req.query; // Récupération de l'ID de l'objet à supprimer

    // Refuse toute méthode autre que DELETE
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Vérifie que l'ID est présent
    if (!id) {
        return res.status(400).json({ error: 'ID d’objet manquant dans l’URL' });
    }

    try {
        // Récupération de l'utilisateur à partir de la requête
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifie si l'utilisateur a la permission de supprimer un objet
        const { permissions } = getUserPermissions(user.pointsss || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Accès refusé : suppression non autorisée' });
        }

        // Supprime l'objet correspondant dans Supabase
        const { data, error } = await supabaseClient
            .from('Object')
            .delete()
            .eq('id', id)
            .select();

        // Gestion des erreurs de suppression
        if (error) {
            console.error('Erreur suppression objet :', error);
            return res.status(500).json({
                error: 'Erreur Supabase',
                details: error.message,
            });
        }
        await logAction(idf,"deleteObject");
        // Renvoie l'objet supprimé
        return res.status(200).json({ deleted: data });
    } catch (err) {
        // Gestion des erreurs inattendues
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
