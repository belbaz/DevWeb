import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS THE LIST OF ALL OBJECT TYPES

export default async function handler(req, res) {
    // Reject if the method is not GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Retrieve the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check user permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: object reading not allowed' });
        }

        // Read objects from the Supabase database
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*');

        // Handle Supabase error
        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error while fetching objects',
                details: error.message,
            });
        }

        // Return the retrieved objects
        return res.status(200).json({ objects: data });

    } catch (err) {
        // Server-side errors
        console.error('Server error:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
