// pages/api/getObject.js

import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";

// get users objects based on their level
export default async function getObject(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const pseudo = getUserFromRequest(req);
    if (!pseudo) {
        return res.status(401).json({ error: 'user not authenticated' });
    }

    const accessMap = {
        debutant: ['debutant'],
        intermediaire: ['debutant', 'intermediaire'],
        avance: ['debutant', 'intermediaire', 'avance'],
        expert: ['debutant', 'intermediaire', 'avance', 'expert']
    };

    try {
        // 1. get user's level
        const { data: userData, error: userError } = await supabase
            .from('User')
            .select('level')
            .eq('pseudo', pseudo)
            .single();

        if (userError || !userData) {
            console.error("user error :", userError);
            return res.status(400).json({ error: "user not found" });
        }

        const level = userData.level;
        const niveauxAccessibles = accessMap[level] || [];

        // 2. get corresponding objects
        const { data: objets, error: objectError } = await supabase
            .from('Object')
            .select('*')
            .in('accesLevel', niveauxAccessibles);

        if (objectError) {
            console.error("object error:", objectError);
            return res.status(500).json({ error: "Error while fetching objects" + objectError?.message });
        }

        // 3. return the objects
        return res.status(200).json({ objets });

    } catch (err) {
        console.error("server error :", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}