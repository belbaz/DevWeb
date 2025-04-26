// pages/api/supabase.js

// Import du client Supabase qui lui se connecte
import supabase from 'lib/supabaseClient';

//creation of the asynchronous function
export default async function handler(req, res) {
    try {
        // Check if the HTTP method is correct (e.g., GET)
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Call Supabase to retrieve data from the "devWebTEST" table
        const { data: devWebTEST, error } = await supabase
            .from('devWebTEST')
            .select('*');

        // Check if an error occurs during the request
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Error retrieving data' });
        }

        // Return the data in the HTTP response
        // console.log(devWebTEST);
        return res.status(200).json(devWebTEST[0].nom);
    } catch (err) {
        // Handle unexpected errors
        console.error('Internal server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}