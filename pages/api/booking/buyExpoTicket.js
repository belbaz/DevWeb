import supabase from 'lib/supabaseClient';
import {generateTicketCode} from 'lib/generateTicketCode';
import {logAction} from "lib/logAction";
import {updateExpoVisitors} from "lib/updateExpoVisitors";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pseudo, title, date, names } = req.body;

    // Check params
    if (!pseudo || !title || !date || !Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid parameters.' });
    }

    try {
        const bookings = await Promise.all(
            names.map(async (name) => {
                const ticketCode = await generateTicketCode();
                return {
                    bookedBy: pseudo,
                    bookedFor: name,
                    date,
                    type: 'expo',
                    details: title,
                    ticketCode,
                };
            })
        );

        const { error } = await supabase.from('Booking').insert(bookings);
        if (error) throw error;

        for (let i = 0; i < names.length; i++) {
            await logAction(pseudo, 'expoVisit');
        }

        await updateExpoVisitors(title, date, names.length);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Expo ticket booking error:', err);
        return res.status(500).json({ error: 'Server error during expo ticket booking.' });
    }
}

