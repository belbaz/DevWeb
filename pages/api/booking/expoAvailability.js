import supabase from 'lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, date } = req.body;

    if (!title || !date) {
        return res.status(400).json({ error: 'Missing title or date in body' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);

    if (inputDate < today) {
        return res.status(200).send('Expired');
    }

    const { data: expos, error } = await supabase
        .from('Expo')
        .select('day1, day2, day3, visitorsDay1, visitorsDay2, visitorsDay3, maxVisitorsPerDay')
        .eq('name', title);

    if (error || !expos || expos.length === 0) {
        return res.status(404).json({ error: 'Expo not found' });
    }

    const expo = expos[0];
    const max = expo.maxVisitorsPerDay;
    let currentVisitors = 0;

    if (expo.day1 === date) {
        currentVisitors = expo.visitorsDay1 || 0;
    } else if (expo.day2 === date) {
        currentVisitors = expo.visitorsDay2 || 0;
    } else if (expo.day3 === date) {
        currentVisitors = expo.visitorsDay3 || 0;
    } else {
        return res.status(400).json({ error: 'Date does not match any expo day' });
    }

    const available = max - currentVisitors;

    if (available <= 0) {
        return res.status(200).send('Sold Out');
    }

    return res.status(200).send(`${available} tickets available`);
}
