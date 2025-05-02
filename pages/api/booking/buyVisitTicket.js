import supabase from 'lib/supabaseClient';
import {generateTicketCode} from 'lib/generateTicketCode';
import {logAction} from "lib/logAction";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pseudo, date, names } = req.body;

    // Check params
    if (!pseudo || !date || !Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid parameters.' });
    }

    try {
        // Content for Booking Table :
        const bookings = await Promise.all(
            names.map(async (name) => {
                const ticketCode = await generateTicketCode();
                return {
                    bookedBy: pseudo,
                    bookedFor: name,
                    date,
                    type: 'visit',
                    details: 'Regular Museum Visit',
                    ticketCode,
                };
            })
        );

        // Insert into Booking Table :
        const { error } = await supabase.from('Booking').insert(bookings);
        if (error) throw error;

        // Points awarded per bought ticket
        for (let i = 0; i < names.length; i++) {
            await logAction(pseudo, 'regularVisit');
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Booking error:', err);
        return res.status(500).json({ error: 'Server error during booking.' });
    }
}
