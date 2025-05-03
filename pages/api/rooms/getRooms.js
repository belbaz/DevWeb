import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

/**
 * API Route Handler (GET only) to retrieve a list of rooms from the "Room" table,
 * optionally filtered by floor, roomtype, and levelAcces.
 *
 * Workflow:
 * 1. Accept GET method only
 * 2. Authenticate the user
 * 3. Check read permissions
 * 4. Extract and apply optional filters (floor, roomtype, levelAcces)
 * 5. Execute query and return result
 *
 * @route GET /api/rooms
 * @queryParam {number} [floor] - Optional floor number filter
 * @queryParam {string} [roomtype] - Optional room type filter (partial match)
 * @queryParam {string} [levelAcces] - Optional access level filter
 * @returns {Object[]} - List of filtered rooms or error
 */
export default async function handler(req, res) {
    // 1. Only allow GET method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check permission to read room data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading rooms not allowed' });
        }

        // 4. Extract filters from query parameters
        const { floor, roomtype, levelAcces } = req.query;

        // 5. Start Supabase query
        let query = supabaseClient.from('Room').select('*');

        // 6. Apply floor filter (if valid)
        if (floor !== undefined) {
            const parsedFloor = parseInt(floor, 10);
            if (!isNaN(parsedFloor)) {
                query = query.eq('floor', parsedFloor);
            }
        }

        // 7. Apply roomtype filter (partial match, case-insensitive)
        if (roomtype) {
            query = query.ilike('roomtype', `%${roomtype}%`);
        }

        // 8. Apply levelAcces filter (exact match)
        if (levelAcces) {
            query = query.eq('levelAcces', levelAcces);
        }

        // 9. Execute the query
        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error retrieving rooms',
                details: error.message,
            });
        }

        // 10. Return filtered room list
        return res.status(200).json({ rooms: data });

    } catch (err) {
        // 11. Handle unexpected server-side errors
        console.error('Server error:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
