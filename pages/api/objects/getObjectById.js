import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS A SINGLE OBJECT BASED ON ITS ID

/**
 * API Route Handler (GET only) to retrieve a single object from the "Object" table by its ID.
 *
 * Workflow:
 * 1. Ensure method is GET
 * 2. Authenticate the user
 * 3. Check user permission to read objects
 * 4. Validate presence of ID in query
 * 5. Fetch object from database
 * 6. Return the object or appropriate error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with object or error
 */
export default async function handler(req, res) {
    // 1. Allow only GET method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has permission to read objects
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        // 4. Check if object ID is provided in query parameters
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Missing ID in the request' });
        }

        // 5. Fetch the object from the database by ID
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            // Handle database errors
            console.error('Supabase error:', error.message);
            return res.status(500).json({ error: 'Error retrieving object', details: error.message });
        }

        // 6. Return the object as JSON
        return res.status(200).json({ object: data });

    } catch (err) {
        // 7. Catch any unexpected server-side errors
        console.error('Server error:', err.message);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
}
