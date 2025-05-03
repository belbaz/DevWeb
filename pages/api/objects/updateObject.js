import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

// Handler to process PUT requests (update an object)
export default async function handler(req, res) {
    const { id } = req.query; // Get the object ID to update from the URL

    // Reject any method other than PUT
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Retrieve the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check update permissions based on user's points
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.updateObject) {
            return res.status(403).json({ error: 'Access denied: update not allowed' });
        }

        // Make sure the ID is provided
        if (!id) {
            return res.status(400).json({ error: 'Missing object ID in the URL' });
        }

        // Get the fields to update from the request body
        const fieldsToUpdate = req.body;

        // Update the object in Supabase
        const { data, error } = await supabaseClient
            .from('Object')
            .update(fieldsToUpdate)
            .eq('id', id)
            .select();

        // Handle Supabase update error
        if (error) {
            console.error('Error updating object:', error);
            return res.status(500).json({
                error: 'Supabase error',
                details: error.message,
            });
        }

        await logAction(user.pseudo, "updateObject");

        // Return the updated object
        return res.status(200).json({ updated: data });
    } catch (err) {
        // Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}