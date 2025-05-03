import supabaseClient from 'lib/supabaseClient.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';

/**
 * Returns all connected objects assigned to a given room.
 * Requires user authentication and read permissions.
 *
 * @route GET /api/rooms/objects?id=3
 * @queryParam {number} id - The ID of the room
 * @returns {Object[]} List of objects in the room
 */
export default async function handler(req, res) {
    // Allow only GET method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Authenticate user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 2. Check user permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading objects not allowed' });
        }

        // 3. Extract room ID from query string
        const roomId = req.query.id;
        if (!roomId) {
            return res.status(400).json({ error: 'Missing room ID in query string.' });
        }

        // 4. Query Supabase for objects in the room
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*')
            .eq('room_id', roomId);

        // 5. Handle Supabase error
        if (error) {
            console.error('Supabase error while fetching objects by room:', error.message);
            return res.status(500).json({
                error: 'Database error while fetching objects',
                details: error.message,
            });
        }

        // 6. Return the object list
        return res.status(200).json({ objects: data });

    } catch (err) {
        // Handle unexpected server error
        console.error('Unexpected server error in /rooms/objects:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
