import supabase from 'lib/supabaseClient';
import { generateTicketCode } from 'lib/generateTicketCode';
import { logAction } from 'lib/logAction';
import { pdfVisitTicketBuffer } from 'lib/pdfVisitTicketBuffer';
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

    const { pseudo, date, names, ages } = req.body;

    if (!pseudo || !date || !Array.isArray(names) || !Array.isArray(ages) || names.length !== ages.length) {
        return res.status(400).json({ error: 'Missing or invalid parameters.' });
    }

    try {
        const zipStream = new stream.PassThrough();
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(zipStream);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="visit_tickets_${pseudo}.zip"`);

        zipStream.pipe(res);

        for (let i = 0; i < names.length; i++) {
            const rawName = names[i];
            const name = formatName(rawName);
            const age = ages[i];
            const ticketCode = await generateTicketCode();

            await supabase.from('Booking').insert({
                bookedBy: pseudo,
                bookedFor: name,
                date,
                type: 'visit',
                details: 'Regular Museum Visit',
                ticketCode,
                age
            });

            await logAction(pseudo, 'regularVisit');

            const pdfBuffer = await pdfVisitTicketBuffer({
                date,
                name,
                ticketCode,
            });

            archive.append(pdfBuffer, { name: `VisitTicket_${name}.pdf` });
        }

        await archive.finalize();
    } catch (err) {
        console.error('Visit ticket generation error:', err);
        return res.status(500).json({ error: 'Internal server error during booking or PDF generation.' });
    }
}
