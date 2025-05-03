import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// Utility function to safely parse JSON, even if double-encoded
function safeParseJson(data) {
    try {
        let result = data;
        while (typeof result === 'string') {
            result = JSON.parse(result);
        }
        return result;
    } catch {
        return null;
    }
}



/**
 * API Route Handler (PUT only) for updating an ObjectData instance.
 * This route also logs the previous state into ObjectDataHistory.
 *
 * Workflow:
 * 1. Verify the method is PUT
 * 2. Authenticate the user
 * 3. Check if user has permission to update data
 * 4. Parse and validate JSON payload
 * 5. Fetch the current data for backup
 * 6. Save the old state in ObjectDataHistory
 * 7. Update the ObjectData record with new data
 * 8. Return the updated record or error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with updated record or error
 */
export default async function handler(req, res) {
    const { id } = req.query;

    // 1. Ensure method is PUT
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has permission to update data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.updateData) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // 4. Ensure object ID is provided
        if (!id) {
            return res.status(400).json({ error: 'Missing object ID in URL' });
        }

        // Parse JSON body (can be stringified or direct JSON)
        // 4. Parse and validate JSON body (supports stringified or direct object)
        let parsedBody;
        try {
            parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch {
            return res.status(400).json({ error: 'Invalid JSON format in body' });
        }

        const jsonData = safeParseJson(parsedBody.data ?? parsedBody);

        if (!jsonData || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
            return res.status(400).json({ error: 'Missing or invalid JSON payload' });
        }


        if (!jsonData || typeof jsonData !== 'object') {
            return res.status(400).json({ error: 'Missing or invalid JSON payload' });
        }

        if (!jsonData || typeof jsonData !== 'object') {
            return res.status(400).json({ error: 'Missing or invalid JSON payload' });
        }

        // 5. Fetch the current state of the object before updating
        const { data: oldState, error: fetchError } = await supabaseClient
            .from('ObjectData')
            .select('data')
            .eq('id', id)
            .single();

        if (fetchError) {
            return res.status(500).json({ error: 'Error fetching current data', details: fetchError.message });
        }

        // Determine who is performing the update (user ID or pseudo)
        const updatedByValue = user.id ?? user.pseudo;
        if (!updatedByValue) {
            return res.status(500).json({ error: 'Cannot determine updatedBy value' });
        }

        // 6. Insert the previous state into ObjectDataHistory
        const { error: insertError } = await supabaseClient
            .from('ObjectDataHistory')
            .insert([{
                object_data_id: parseInt(id, 10),
                old_data: oldState.data,
                updatedBy: updatedByValue,
                updated_at: new Date().toISOString()
            }]);

        if (insertError) {
            return res.status(500).json({ error: 'Error inserting into history', details: insertError.message });
        }

        // 7. Update the current ObjectData record with new values
        const { data: updatedData, error: updateError } = await supabaseClient
            .from('ObjectData')
            .update({ data: jsonData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: 'Error updating ObjectData', details: updateError.message });
        }

        // 8. Return the updated object
        return res.status(200).json({ updated: updatedData });

    } catch (err) {
        // Handle unexpected server-side errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
}
