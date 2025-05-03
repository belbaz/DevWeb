// pages/api/objectDataHistory/getHistoryEntry.js

import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETRIEVES A SINGLE HISTORY ENTRY BY ID

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // Only GET method is allowed
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate the user
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'User not authenticated' });

    // Check if the user has permission to read data
    const { permissions } = getUserPermissions(user.points);
    if (!permissions.readData) {
        return res.status(403).json({ error: 'Access denied: reading not allowed' });
    }

    const { id } = req.query;

    // Check if ID is provided
    if (!id) {
        return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    // Fetch the specific history entry by ID
    const { data, error } = await supabaseClient
        .from('ObjectDataHistory')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching history entry:', error);
        return res.status(500).json({ error: 'Error retrieving history entry' });
    }

    // Return the history entry
    return res.status(200).json({ historyEntry: data });
}
