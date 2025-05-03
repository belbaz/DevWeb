import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// Handler to return a list of rooms with optional filters
export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get user from request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check user permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading rooms not allowed' });
        }

        // Extract optional filters from URL
        const { floor, roomtype, levelAcces } = req.query;

        // Base Supabase query
        let query = supabaseClient.from('Room').select('*');

        // Filter by floor (if valid)
        if (floor !== undefined) {
            const parsedFloor = parseInt(floor, 10);
            if (!isNaN(parsedFloor)) {
                query = query.eq('floor', parsedFloor);
            }
        }

        // Filter by room type
        if (roomtype) {
            query = query.ilike('roomtype', `%${roomtype}%`);
        }

        // Filter by access level
        if (levelAcces) {
            query = query.eq('levelAcces', levelAcces);
        }

        // Execute the query
        const { data, error } = await query;

        // Handle Supabase error
        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error retrieving rooms',
                details: error.message,
            });
        }

        // Return filtered rooms
        return res.status(200).json({ rooms: data });

    } catch (err) {
        // Handle unexpected server error
        console.error('Server error:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
