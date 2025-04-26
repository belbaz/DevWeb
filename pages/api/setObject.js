// pages/api/setObject.js

import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";

export default async function setObject(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send(`Method ${req.method} Not Allowed`);
    }

    const pseudo = getUserFromRequest(req);
    if (!pseudo) {
        return res.status(401).json({ error: 'user not authenticated' });
    }

    const { id, description, brand, type, room_id, accesLevel } = req.body;

    if (!id || !accesLevel || !description || !brand || !type || !room_id) {
        return res.status(400).json({ error: 'incomplete data' });
    }

    const accessMap = {
        debutant: ['debutant'],
        intermediaire: ['debutant', 'intermediaire'],
        avance: ['debutant', 'intermediaire', 'avance'],
        expert: ['debutant', 'intermediaire', 'avance', 'expert']
    };

    try {
        // get user's level
        const { data: userData, error: userError } = await supabase
            .from('User')
            .select('level')
            .eq('pseudo', pseudo)
            .single();

        if (userError || !userData) {
            return res.status(400).json({ error: 'user not found' });
        }

        const userLevel = userData.level;
        const allowedLevels = accessMap[userLevel] || [];
        console.log(allowedLevels);

        // check if the user has the right to modify the object
        if (!allowedLevels.includes(accesLevel)) {
            return res.status(403).json({ error: 'user is not allowed to change this object' });
        }

        // updating objects
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
            .select(); // return the updated object

        if (updateError) {
            console.error("error while updating object :", updateError);
            return res.status(500).json({ error: "error while updating object :" + updateError.message });
        }

        return res.status(200).json({ message: 'object updated successfully ! object : ', objet: updatedObject });

    } catch (err) {
        console.error("server error :", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
