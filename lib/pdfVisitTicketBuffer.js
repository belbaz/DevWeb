const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function pdfVisitTicketBuffer({ date, name, ticketCode }) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 30 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const bannerPath = path.resolve('public/images/museumBanner.png');
            if (fs.existsSync(bannerPath)) {
                doc.image(bannerPath, {
                    width: 540,
                    align: 'center',
                    valign: 'top',
                });
                doc.moveDown(2);
            }

            doc.fontSize(30).text(`MUSEHOME - VISIT TICKET`);
            doc.moveDown(2);

            doc.fontSize(20);
            doc.text(`Name : ${name}`);
            doc.text(`Date : ${new Date(date).toLocaleDateString()}`);
            doc.text(`Ticket Code : ${ticketCode}`);
            doc.moveDown(2);

            const qrCodeDataUrl = await QRCode.toDataURL(ticketCode);
            const qrImage = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
            const qrBuffer = Buffer.from(qrImage, 'base64');
            doc.image(qrBuffer, { fit: [200, 200] });

            doc.moveDown(2);
            doc.fontSize(10).fillColor('gray').text('MuseHome © 2025 - Digital Ticket System', {
                align: 'center',
            });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { pdfVisitTicketBuffer };
