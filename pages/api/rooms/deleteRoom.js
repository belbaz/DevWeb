import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

/**
 * API Route Handler (DELETE only) to delete a room from the "Room" table.
 *
 * Workflow:
 * 1. Ensure method is DELETE
 * 2. Authenticate the user
 * 3. Check if user has permission to delete
 * 4. Parse and validate the room ID
 * 5. Delete the room from the database
 * 6. Log the deletion (note: currently logs "login", consider changing to "deleteRoom")
 * 7. Return the deleted room data or error
 *
 * @route DELETE /api/rooms/:id
 * @queryParam {number} id - ID of the room to delete (required)
 * @returns {Object} - JSON containing deleted room or error
 */
export default async function handler(req, res) {
    // 1. Only allow DELETE method
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Parse and validate the room ID from query
    const { id } = req.query;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid or missing room ID' });
    }

    try {
        // 3. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 4. Check if the user has permission to delete a room
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Access denied: deletion not allowed' });
        }

        // 5. Delete the room from Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .delete()
            .eq('id', parsedId)
            .select();

        if (error) {
            console.error('Room deletion error:', error);
            return res.status(500).json({
                error: 'Supabase error',
                details: error.message,
            });
        }

        // 6. Log the deletion action (currently logs "login", you might want to change this to "deleteRoom")
        await logAction(user.pseudo, "login");

        // 7. Return the deleted room data
        return res.status(200).json({ deleted: data });

    } catch (err) {
        // 8. Catch unexpected errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
