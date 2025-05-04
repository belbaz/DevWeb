const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');


async function pdfExpoTicket(res, data) {
    const { expoTitle, date, name, ticketCode, bannerUrl } = data;

    if (!expoTitle || !date || !name || !ticketCode || !bannerUrl) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        const qrCodeDataUrl = await QRCode.toDataURL(ticketCode);
        const qrImage = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(qrImage, 'base64');

        const doc = new PDFDocument({ size: 'A4', margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="expoTicket.pdf"');
        doc.pipe(res);

        // Bannière
        const bannerPath = path.resolve('public/images/expoBanners', path.basename(bannerUrl));
        if (fs.existsSync(bannerPath)) {
            doc.image(bannerPath, {
                width: 540,
                align: 'center',
                valign: 'top',
            });
            doc.moveDown(2);
        }

        // Infos
        doc.fontSize(20);
        doc.text(`Name : ${name}`);
        doc.text(`Date : ${new Date(date).toLocaleDateString()}`);
        doc.text(`Ticket Code : ${ticketCode}`);
        doc.moveDown(2);

        // QR Code
        doc.image(qrBuffer, {
            fit: [200, 200],
        });

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).fillColor('gray').text('MuseHome © 2025 - Digital Ticket System', {
            align: 'center',
        });

        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
}

module.exports = { pdfExpoTicket };
