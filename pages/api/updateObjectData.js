import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";
import { getUserPermissions } from "lib/getUserPermissions";

export default async function updateObjectData(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const pseudo = getUserFromRequest(req);
    if (!pseudo) {
        return res.status(401).json({ error: 'user not authenticated' });
    }

    const { id, newData } = req.body;
    if (!id || !newData) {
        return res.status(400).json({ error: "Missing id or newData" });
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

        // 2. Check if user has permission to update
        if (!permissions.addData && !permissions.deleteData) {
            return res.status(403).json({ error: "Forbidden: insufficient permissions" });
        }

        // 3. Update object data
        const { error: updateError } = await supabase
            .from('ObjectData')
            .update({ data: newData, updated_at: new Date() })
            .eq('id', id);

        if (updateError) {
            console.error("update error:", updateError);
            return res.status(500).json({ error: "Error updating object data" });
        }

        return res.status(200).json({ message: "Object data updated successfully" });

    } catch (err) {
        console.error("server error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
