// pages/api/objectDataHistory/getHistoryEntry.js

import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETRIEVES A SINGLE HISTORY ENTRY BY ID

/**
 * API Route Handler (GET only) to retrieve a single ObjectDataHistory entry by its ID.
 *
 * Workflow:
 * 1. Ensure the method is GET
 * 2. Authenticate the user
 * 3. Verify permission to read data
 * 4. Validate the presence of the entry ID
 * 5. Query the ObjectDataHistory table by ID
 * 6. Return the entry or appropriate error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with historyEntry or error
 */
export default async function handler(req, res) {
    // 1. Only allow GET method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Authenticate the user
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'User not authenticated' });

    // 3. Check if the user has permission to read data
    const { permissions } = getUserPermissions(user.points);
    if (!permissions.readData) {
        return res.status(403).json({ error: 'Access denied: reading not allowed' });
    }

    const { id } = req.query;

    // 4. Validate that the ID parameter is provided
    if (!id) {
        return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    // 5. Fetch the specific history entry by its ID
    const { data, error } = await supabaseClient
        .from('ObjectDataHistory')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        // Handle fetch error from Supabase
        console.error('Error fetching history entry:', error);
        return res.status(500).json({ error: 'Error retrieving history entry' });
    }

    // 6. Return the fetched history entry
    return res.status(200).json({ historyEntry: data });
}
