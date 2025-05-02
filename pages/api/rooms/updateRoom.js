import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import {logAction} from "lib/logAction";

// Handler pour traiter les requêtes PUT (mise à jour d’une pièce)
export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { id } = req.query;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'ID de pièce invalide ou manquant dans l’URL' });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérification des permissions de mise à jour
        const { permissions } = getUserPermissions(user.points || 0);
        console.log("POINTS =", user.points);
        console.log("PERMISSIONS =", permissions);
        if (!permissions.updateObject) {
            return res.status(403).json({ error: 'Accès refusé : modification non autorisée' });
        }

        const fieldsToUpdate = req.body;

        // Vérifie que roomtype est bien présent s'il est mis à jour
        if (fieldsToUpdate.hasOwnProperty('roomtype') && !fieldsToUpdate.roomtype) {
            return res.status(400).json({ error: 'Le champ roomtype ne peut pas être vide' });
        }

        const { data, error } = await supabaseClient
            .from('Room')
            .update(fieldsToUpdate)
            .eq('id', parsedId)
            .select();

        if (error) {
            console.error('Erreur mise à jour pièce :', error);
            return res.status(500).json({ error: 'Erreur Supabase', details: error.message });
        }
        await logAction(idf,"updateRoom");
        return res.status(200).json({ updated: data });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
