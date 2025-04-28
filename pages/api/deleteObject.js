import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";
import { getUserPermissions } from "lib/getUserPermissions";

export default async function deleteObject(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const pseudo = getUserFromRequest(req);
    if (!pseudo) {
        return res.status(401).json({ error: 'user not authenticated' });
    }

    const { type } = req.body;

    if (!type) {
        return res.status(400).json({ error: "Missing required field: type" });
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

        // 2. Check permission to delete an object
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: "Forbidden: insufficient permissions to delete object" });
        }

        // 3. Delete object
        const { error: deleteError } = await supabase
            .from('Object')
            .delete()
            .eq('type', type);

        if (deleteError) {
            console.error("delete error:", deleteError);
            return res.status(500).json({ error: "Error deleting object" });
        }

        return res.status(200).json({ message: "Object deleted successfully" });

    } catch (err) {
        console.error("server error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
