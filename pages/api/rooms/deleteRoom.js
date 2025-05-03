import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

// Handler to process a DELETE request (deleting a room)
export default async function handler(req, res) {
    // Only allow DELETE method
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate and parse the ID from the URL
    const { id } = req.query;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid or missing room ID' });
    }

    try {
        // Get the authenticated user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if user has permission to delete a room
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Access denied: deletion not allowed' });
        }

        // Perform deletion in Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .delete()
            .eq('id', parsedId)
            .select();

        // Handle Supabase errors
        if (error) {
            console.error('Room deletion error:', error);
            return res.status(500).json({
                error: 'Supabase error',
                details: error.message,
            });
        }

        // Log the action
        await logAction(idf, "login");

        // Return deleted data
        return res.status(200).json({ deleted: data });
    } catch (err) {
        // Catch unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
