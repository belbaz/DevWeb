import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS A SINGLE OBJECT BASED ON ITS ID

// Handler function to process a GET request
export default async function handler(req, res) {
    // Reject any method other than GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Retrieve the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if the user has permission to read an object
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        // Check that the object ID is present in the request
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Missing ID in the request' });
        }

        // Retrieve the object from the Supabase database
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*')
            .eq('id', id)
            .single();

        // Handle Supabase errors
        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({ error: 'Error retrieving object', details: error.message });
        }

        // Return the found object
        return res.status(200).json({ object: data });

    } catch (err) {
        // Handle general server errors
        console.error('Server error:', err.message);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
}
