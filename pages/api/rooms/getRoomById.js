import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// Handler to return a specific room by its ID
export default async function handler(req, res) {
    // Allow only GET method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log("test");

    try {
        // Get the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if the user has permission to read room data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading rooms not allowed' });
        }

        // Validate the room ID from the query
        const { id } = req.query;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'Invalid or missing room ID in the request' });
        }

        // Fetch the room from Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .select('*')
            .eq('id', parsedId)
            .single();

        // Handle Supabase error
        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error retrieving the room',
                details: error.message,
            });
        }

        // Return the found room
        return res.status(200).json({ room: data });

    } catch (err) {
        // Catch unexpected server error
        console.error('Server error:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
