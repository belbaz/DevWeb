import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS A SINGLE OBJECT BASED ON ITS ID

// Handler function to process a GET request
export default async function handler(req, res) {
    // Check that the method is GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Missing object ID' });
    }

    try {
        // Retrieve the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check user permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        // Supabase query to get the object by ID
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error.message);
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Object not found' });
            }
            return res.status(500).json({
                error: 'Error while retrieving the object',
                details: error.message,
            });
        }

        // Return the object
        return res.status(200).json({ object: data });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
