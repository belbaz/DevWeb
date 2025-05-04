import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

/**
 * API Route Handler (POST only) to create a new room in the "Room" table.
 *
 * Workflow:
 * 1. Accept POST method only
 * 2. Authenticate the user
 * 3. Check if user has permission to create a room
 * 4. Parse and validate input (name, floor, roomtype, levelAcces)
 * 5. Determine new room ID based on current max
 * 6. Insert the new room
 * 7. Log the action
 * 8. Return created room or an error
 *
 * @route POST /api/rooms
 * @bodyParam {string} name - Name of the room (required)
 * @bodyParam {number} floor - Floor number (required)
 * @bodyParam {string} roomtype - Room type (required)
 * @bodyParam {string} [levelAcces="beginner"] - Access level (optional)
 * @returns {Object} - JSON containing the created room or an error message
 */
export default async function handler(req, res) {
    // 1. Only accept POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate user from request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if user has permission to add a room
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.addObject) {
            return res.status(403).json({ error: 'Access denied: room creation not allowed' });
        }

        // 4. Parse and validate input
        const { name, floor, levelAcces = 'beginner', roomtype } = JSON.parse(req.body);

        if (!name || isNaN(floor) || !roomtype) {
            return res.status(400).json({ error: 'Champs obligatoires manquants ou invalides ' + name + " " + floor + " " + roomtype });
        }

        // 5. Get the max existing room ID to increment it manually
        const { data: maxData, error: maxError } = await supabaseClient
            .from('Room')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        if (maxError) {
            console.error('Error retrieving max ID:', maxError);
            return res.status(500).json({ error: 'Error retrieving ID', details: maxError.message });
        }

        const maxId = maxData?.[0]?.id || 0;
        const newId = maxId + 1;

        // 6. Insert new room
        const { data, error } = await supabaseClient
            .from('Room')
            .insert([{
                id: newId,
                name,
                floor,
                levelAcces,
                roomtype
            }])
            .select();

        if (error) {
            console.error('Room creation error:', error);
            return res.status(500).json({ error: 'Supabase error', details: error.message });
        }

        // 7. Log the creation action
        await logAction(user.pseudo, "addRoom");

        // 8. Return the created room
        return res.status(201).json({ created: data });

    } catch (err) {
        // Handle unexpected errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
