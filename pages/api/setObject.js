// pages/api/setObject.js

import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";

export default async function setObject(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const pseudo = getUserFromRequest(req);
    if (!pseudo) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const { id, description, brand, type, room_id, accesLevel } = req.body;

    if (!id || !accesLevel || !description || !brand || !type || !room_id) {
        return res.status(400).json({ error: 'Données incomplètes' });
    }

    const accessMap = {
        debutant: ['debutant'],
        intermediaire: ['debutant', 'intermediaire'],
        avance: ['debutant', 'intermediaire', 'avance'],
        expert: ['debutant', 'intermediaire', 'avance', 'expert']
    };

    try {
        // Récupération du niveau de l'utilisateur
        const { data: userData, error: userError } = await supabase
            .from('User')
            .select('level')
            .eq('pseudo', pseudo)
            .single();

        if (userError || !userData) {
            return res.status(400).json({ error: 'Utilisateur non trouvé' });
        }

        const userLevel = userData.level;
        const niveauxAutorises = accessMap[userLevel] || [];
        console.log(niveauxAutorises);

        // Vérifier si l'utilisateur a le droit de modifier cet objet
        if (!niveauxAutorises.includes(accesLevel)) {
            return res.status(403).json({ error: 'Droits insuffisants pour modifier cet objet' });
        }

        // Mise à jour de l'objet
        const { data: updatedObject, error: updateError } = await supabase
            .from('Object')
            .update({
                description,
                brand,
                type,
                room_id,
                accesLevel
            })
            .eq('id', id)
            .select(); // pour renvoyer l'objet mis à jour

        if (updateError) {
            console.error("Erreur lors de la mise à jour :", updateError);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }

        return res.status(200).json({ message: 'Objet mis à jour avec succès', objet: updatedObject });

    } catch (err) {
        console.error("Erreur serveur :", err);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}
