import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

/**
 * API Route Handler (GET only) to retrieve a single room by its ID from the "Room" table.
 *
 * Workflow:
 * 1. Allow GET method only
 * 2. Authenticate the user
 * 3. Check read permissions
 * 4. Validate and parse room ID from query
 * 5. Fetch the room from Supabase
 * 6. Return the room or an error
 *
 * @route GET /api/rooms/:id
 * @queryParam {number} id - The ID of the room to retrieve
 * @returns {Object} - JSON response with the room data or error
 */
export default async function handler(req, res) {
    // 1. Only allow GET method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log("test"); // Debug log (can be removed in production)

    try {
        // 2. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check read permission
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading rooms not allowed' });
        }

        // 4. Validate and parse the room ID
        const { id } = req.query;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'Invalid or missing room ID in the request' });
        }

        // 5. Fetch the room from Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .select('*')
            .eq('id', parsedId)
            .single();

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error retrieving the room',
                details: error.message,
            });
        }

        // 6. Return the room data
        return res.status(200).json({ room: data });

    } catch (err) {
        // Handle unexpected errors
        console.error('Server error:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
