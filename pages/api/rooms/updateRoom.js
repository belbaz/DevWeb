import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

// Handler to process PUT requests (update a room)
export default async function handler(req, res) {
    // Only allow PUT method
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse and validate the room ID from the URL
    const { id } = req.body;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid or missing room ID in URL' });
    }

    try {
        // Get user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check update permissions
        const { permissions } = getUserPermissions(user.points || 0);
        console.log("POINTS =", user.points);
        console.log("PERMISSIONS =", permissions);
        if (!permissions.updateObject) {
            return res.status(403).json({ error: 'Access denied: update not allowed' });
        }

        // Get fields to update from request body
        const fieldsToUpdate = req.body;

        // Ensure 'roomtype' is not empty if present
        if (fieldsToUpdate.hasOwnProperty('roomtype') && !fieldsToUpdate.roomtype) {
            return res.status(400).json({ error: 'Field "roomtype" cannot be empty' });
        }

        // Update the room in Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .update(fieldsToUpdate)
            .eq('id', parsedId)
            .select();

        if (error) {
            console.error('Room update error:', error);
            return res.status(500).json({ error: 'Supabase error', details: error.message });
        }

        // Log the update action
        await logAction(user?.pseudo, "updateRoom");

        // Return updated room data
        return res.status(200).json({ updated: data });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
