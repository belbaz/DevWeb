import supabase from 'lib/supabaseClient';
import { generateTicketCode } from 'lib/generateTicketCode';
import { logAction } from 'lib/logAction';
import { updateExpoVisitors } from 'lib/updateExpoVisitors';
import { pdfExpoTicketBuffer } from 'lib/pdfExpoTicketBuffer';

import archiver from 'archiver';
import stream from 'stream';

function formatName(name) {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { pseudo, title, date, names, ages } = req.body;

    try {
        names = JSON.parse(names);
        ages = JSON.parse(ages);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON format in names or ages.' });
    }

    if (!pseudo || !title || !date || !Array.isArray(names) || names.length === 0 || !Array.isArray(ages) || names.length !== ages.length) {
        return res.status(400).json({ error: 'Missing or invalid parameters.' });
    }

    try {
        // Récupérer la bannière
        const { data: expos, error: expoError } = await supabase
            .from('Expo')
            .select('banner')
            .eq('name', title)
            .limit(1)
            .single();

        if (expoError || !expos) {
            return res.status(404).json({ error: 'Expo not found' });
        }

        const bannerUrl = expos.banner;

        const zipStream = new stream.PassThrough();
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(zipStream);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="tickets_${title.replace(/\s+/g, '_')}.zip"`);

        zipStream.pipe(res); // envoie le zip au fur et à mesure

        for (let i = 0; i < names.length; i++) {
            const rawName = names[i];
            const name = formatName(rawName);

            const age = ages[i];
            const ticketCode = await generateTicketCode();

            // Enregistrer le booking
            const { error: insertError } = await supabase.from('Booking').insert({
                bookedBy: pseudo,
                bookedFor: name,
                date,
                type: 'expo',
                details: title,
                ticketCode,
                age
            });

            if (insertError) throw insertError;

            await logAction(pseudo, 'expoVisit');

            const pdfBuffer = await pdfExpoTicketBuffer({
                expoTitle: title,
                date,
                name,
                ticketCode,
                bannerUrl
            });

            archive.append(pdfBuffer, { name: `Ticket_${name}.pdf` });
        }

        await updateExpoVisitors(title, date, names.length);

        archive.finalize();

    } catch (err) {
        console.error('Ticket booking error:', err);
        return res.status(500).json({ error: 'Internal server error during booking or PDF generation.' });
    }
}

