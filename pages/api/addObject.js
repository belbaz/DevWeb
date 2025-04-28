import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";
import { getUserPermissions } from "lib/getUserPermissions";

export default async function addObject(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const pseudo = getUserFromRequest(req);
    if (!pseudo) {
        return res.status(401).json({ error: 'user not authenticated' });
    }

    const { description, brand, type, room_id, accesLevel } = req.body;

    if (!description || !type) {
        return res.status(400).json({ error: "Missing required fields: description or type" });
    }

    try {
        // 1. Get user points
        const { data: userData, error: userError } = await supabase
            .from('User')
            .select('points')
            .eq('pseudo', pseudo)
            .single();

        if (userError || !userData) {
            console.error("user error :", userError);
            return res.status(400).json({ error: "User not found" });
        }

        const { permissions } = getUserPermissions(userData.points);

        // 2. Check permission to add an object
        if (!permissions.addObject) {
            return res.status(403).json({ error: "Forbidden: insufficient permissions to add object" });
        }

        // 3. Insert new object
        const { error: insertError } = await supabase
            .from('Object')
            .insert({
                description,
                brand,
                type,
                room_id,
                accesLevel
            });

        if (insertError) {
            console.error("insert error:", insertError);
            return res.status(500).json({ error: "Error inserting new object" });
        }

        return res.status(200).json({ message: "Object added successfully" });

    } catch (err) {
        console.error("server error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
