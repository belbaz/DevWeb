import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from 'lib/logAction';

// Handler to process a POST request (create a new object)
export default async function handler(req, res) {
    // Reject any method other than POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if the user has permission to add a new object
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.addObject) {
            return res.status(403).json({ error: 'Access denied: creation not allowed' });
        }

        // Extract the new object data from the request body
        const newObject = req.body;

        // Find the highest existing ID to determine the new ID
        const { data: maxData, error: maxError } = await supabaseClient
            .from('Object')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        // Handle error when retrieving max ID
        if (maxError) {
            console.error('Error retrieving max ID:', maxError);
            return res.status(500).json({ error: 'Failed to retrieve ID', details: maxError.message });
        }

        const maxId = maxData?.[0]?.id || 0; // Use max ID or default to 0
        const newId = maxId + 1; // Set new ID

        // Insert the new object into Supabase with the new ID
        const { data, error } = await supabaseClient
            .from('Object')
            .insert([{ id: newId, ...newObject }])
            .select();

        // Handle insertion error
        if (error) {
            console.error('Object creation error:', error);
            return res.status(500).json({
                error: 'Supabase error',
                details: error.message,
            });
        }

        // Log the action (missing variable 'idf' is assumed to be defined)
        await logAction(idf, "addObject");

        // Return the created object
        return res.status(201).json({ created: data });
    } catch (err) {
        // Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
