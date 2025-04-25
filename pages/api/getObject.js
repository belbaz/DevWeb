// pages/api/getObject.js

import supabase from "lib/supabaseClient";
import {getUserFromRequest} from "lib/getUserFromRequest";

export default async function getObject(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Méthode non autorisée'});
    }

    const pseudo = getUserFromRequest(req);
    // console.log(pseudo);
    if (!pseudo) {
        return res.status(401).json({error: 'Utilisateur non authentifié'});
    }

    const accessMap = {
        debutant: ['debutant'],
        intermediaire: ['debutant', 'intermediaire'],
        avance: ['debutant', 'intermediaire', 'avance'],
        expert: ['debutant', 'intermediaire', 'avance', 'expert']
    };

    try {
        // 1. Récupération du niveau utilisateur
        const { data: userData, error: userError } = await supabase
            .from('User')
            .select('level')
            .eq('pseudo', pseudo)
            .single();

        if (userError || !userData) {
            console.error("Erreur utilisateur :", userError);
            return res.status(400).json({ error: "Utilisateur non trouvé" });
        }

        const level = userData.level;
        const niveauxAccessibles = accessMap[level] || [];

        console.log("pseudo :", pseudo, "/ level :", level, "/ accès autorisé :", niveauxAccessibles);

        // 2. Récupération des objets correspondant au niveau
        const { data: objets, error: objectError } = await supabase
            .from('Object')
            .select('*')
            .in('accesLevel', niveauxAccessibles);

        if (objectError) {
            console.error("Erreur objets :", objectError);
            return res.status(500).json({ error: "Erreur lors de la récupération des objets" });
        }

        // 3. Réponse avec les objets accessibles
        return res.status(200).json({ objets });

    } catch (err) {
        console.error("Erreur serveur :", err);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}