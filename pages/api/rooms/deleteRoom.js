import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import {logAction} from "lib/logAction";

// Handler pour traiter une requête DELETE (suppression d’une pièce)
export default async function handler(req, res) {
    // Refuse toute méthode autre que DELETE
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Vérifie que l'ID est bien fourni et est un nombre entier
    const { id } = req.query;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'ID de pièce invalide ou manquant' });
    }

    try {
        // Récupération de l'utilisateur
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifie si l'utilisateur a la permission de supprimer une pièce
        const { permissions } = getUserPermissions(user.pointsss || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Accès refusé : suppression non autorisée' });
        }

        // Suppression dans Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .delete()
            .eq('id', parsedId)
            .select();

        if (error) {
            console.error('Erreur suppression pièce :', error);
            return res.status(500).json({
                error: 'Erreur Supabase',
                details: error.message,
            });
        }
        await logAction(idf,"login");
        return res.status(200).json({ deleted: data });
    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
