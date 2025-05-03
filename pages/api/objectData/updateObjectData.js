import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// UPDATES AN OBJECTDATA INSTANCE AND SAVES A SNAPSHOT IN HISTORY

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'PUT') {
        // Only PUT method is allowed
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if the user has permission to update data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.updateData) {
            return res.status(403).json({ error: 'Access denied: data update not allowed' });
        }

        // Ensure ID is provided in the URL
        if (!id) {
            return res.status(400).json({ error: 'Missing ID in the URL' });
        }

        const { data: jsonData } = req.body;

        // Validate JSON payload
        if (!jsonData || typeof jsonData !== 'object') {
            return res.status(400).json({ error: 'Missing or invalid JSON data' });
        }

        // Retrieve current state of the object (before update)
        const { data: currentData, error: readError } = await supabaseClient
            .from('ObjectData')
            .select('data')
            .eq('id', id)
            .single();

        if (readError || !currentData) {
            console.error('Error reading current data:', readError?.message);
            return res.status(500).json({
                error: 'Error retrieving current state',
                details: readError?.message,
            });
        }

        // Insert the current state into ObjectDataHistory as a snapshot
        const { error: insertError } = await supabaseClient
            .from('ObjectDataHistory')
            .insert([
                {
                    object_data_id: id,
                    old_data: currentData.data
                }
            ]);

        if (insertError) {
            console.error('Error inserting into history:', insertError.message);
            return res.status(500).json({
                error: 'Error saving to history',
                details: insertError.message,
            });
        }

        // Update the ObjectData with the new data
        const { data, error } = await supabaseClient
            .from('ObjectData')
            .update({ data: jsonData })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating ObjectData:', error);
            return res.status(500).json({
                error: 'Supabase update error',
                details: error.message,
            });
        }

        // Return the updated data
        return res.status(200).json({ updated: data });
    } catch (err) {
        // Handle unexpected errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
