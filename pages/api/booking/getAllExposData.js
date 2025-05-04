import supabase from 'lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { data: expos, error } = await supabase
        .from('Expo')
        .select('*')
        .order('day1', { ascending: false });

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch expositions' });
    }

    const result = expos.map((expo) => ({
        id: expo.id,
        name: expo.name,
        theme: expo.theme,
        description: expo.description,
        dates: [expo.day1, expo.day2, expo.day3],
        priceAdult: expo.priceAdult,
        priceChild: expo.priceChild,
        banner: expo.banner || null,
        poster: expo.poster || null
    }));

    return res.status(200).json(result);
}
