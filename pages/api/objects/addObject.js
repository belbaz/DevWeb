import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from 'lib/logAction';

// Handler to process a POST request (create a new object)

/**
 * API Route Handler (POST only) for creating a new object in the "Object" table.
 *
 * Workflow:
 * 1. Ensure method is POST
 * 2. Authenticate the user
 * 3. Check if user has permission to add an object
 * 4. Parse object data from request
 * 5. Get the current max ID to compute the next one
 * 6. Insert the new object into the table
 * 7. Log the action
 * 8. Return the created object or an appropriate error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with the created object or error
 */
export default async function handler(req, res) {
    // 1. Reject any request that is not a POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has permission to add an object
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.addObject) {
            return res.status(403).json({ error: 'Access denied: creation not allowed' });
        }

        // 4. Extract the object data from the request body
        console.log("Received request body:", req.body);
        const newObject = JSON.parse(req.body);

        // 5. Get the current max ID from the Object table
        const { data: maxData, error: maxError } = await supabaseClient
            .from('Object')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        if (maxError) {
            // Handle error while retrieving max ID
            console.error('Error retrieving max ID:', maxError);
            return res.status(500).json({ error: 'Failed to retrieve ID', details: maxError.message });
        }

        // 6. Determine the new ID to use
        const maxId = maxData?.[0]?.id || 0;
        const newId = maxId + 1;

        // Insert the new object with the computed ID
        const { data, error } = await supabaseClient
            .from('Object')
            .insert([{ id: newId, ...newObject }])
            .select();

        if (error) {
            // Handle insertion error
            console.error('Object creation error:', error);
            return res.status(500).json({
                error: 'Supabase error',
                details: error.message,
            });
        }

        // 7. Log the user action
        await logAction(user.pseudo, "addObject");

        // 8. Return the inserted object
        return res.status(201).json({ created: data });

    } catch (err) {
        // Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
