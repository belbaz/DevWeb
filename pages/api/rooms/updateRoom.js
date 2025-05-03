import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

/**
 * API Route Handler (PUT only) to update a room in the "Room" table.
 *
 * Workflow:
 * 1. Accept PUT method only
 * 2. Authenticate the user
 * 3. Check update permissions
 * 4. Validate room ID from request body
 * 5. Validate non-empty 'roomtype' if provided
 * 6. Update the room data in Supabase
 * 7. Log the update action
 * 8. Return updated room or error
 *
 * @route PUT /api/rooms
 * @bodyParam {number} id - ID of the room to update (required)
 * @bodyParam {string} [name] - New name
 * @bodyParam {number} [floor] - New floor
 * @bodyParam {string} [roomtype] - New room type (must not be empty if present)
 * @bodyParam {string} [levelAcces] - New access level
 * @returns {Object} - Updated room or error message
 */
export default async function handler(req, res) {
    // 1. Only allow PUT method
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Parse and validate room ID from request body
    const { id } = req.body;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid or missing room ID in URL' });
    }

    try {
        // 3. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 4. Check permission to update rooms
        const { permissions } = getUserPermissions(user.points || 0);
        console.log("POINTS =", user.points);
        console.log("PERMISSIONS =", permissions);
        if (!permissions.updateObject) {
            return res.status(403).json({ error: 'Access denied: update not allowed' });
        }

        // 5. Extract and validate fields to update
        const fieldsToUpdate = req.body;
        if (fieldsToUpdate.hasOwnProperty('roomtype') && !fieldsToUpdate.roomtype) {
            return res.status(400).json({ error: 'Field "roomtype" cannot be empty' });
        }

        // 6. Update the room in Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .update(fieldsToUpdate)
            .eq('id', parsedId)
            .select();

        if (error) {
            console.error('Room update error:', error);
            return res.status(500).json({ error: 'Supabase error', details: error.message });
        }

        // 7. Log the update action
        await logAction(user?.pseudo, "updateRoom");

        // 8. Return updated room data
        return res.status(200).json({ updated: data });

    } catch (err) {
        // Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
