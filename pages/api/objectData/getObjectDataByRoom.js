import supabaseClient from 'lib/supabaseClient.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';

/**
 * Returns all object data entries assigned to a given room.
 * Requires user authentication and read permissions.
 *
 * @route GET /api/objectData/getObjectDataByRoom?id=3
 * @queryParam {number} id - The ID of the room
 * @returns {Object[]} List of object data entries in the room
 */
export default async function handler(req, res) {
    // 1. Allow only GET method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if user has permission to read object data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading object data not allowed' });
        }

        // 4. Extract the room ID from the query string
        const roomId = req.query.id;
        if (!roomId) {
            return res.status(400).json({ error: 'Missing room ID in query string.' });
        }

        // 5. Query Supabase for object data entries associated with the room
        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select(`
                id,
                data,
                type_Object,
                room_id,
                Object: type_Object (
                    type,
                    brand,
                    accessLevel,
                    description
                )
            `)
            .eq('room_id', roomId);


        // 6. Handle Supabase errors
        if (error) {
            console.error('Supabase error while fetching object data by room:', error.message);
            return res.status(500).json({
                error: 'Database error while fetching object data',
                details: error.message,
            });
        }

        // 7. Return the list of object data entries
        return res.status(200).json({ objectData: data });

    } catch (err) {
        // 8. Handle unexpected server-side errors
        console.error('Unexpected server error in /rooms/objectdatas:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
