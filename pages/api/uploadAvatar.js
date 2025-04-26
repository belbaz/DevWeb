// pages/api/uploadAvatar.js

import fetch from 'node-fetch';
import supabase from 'lib/supabaseClient';

export default async function uploadAvatar(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'post method required' });
    }

    const { pseudo, imageBase64, fallbackImageUrl } = req.body;

    if (!pseudo) {
        return res.status(400).json({ error: 'a username is required' });
    }

    try {
        let buffer;
        let contentType = 'image/png'; // default value

        if (imageBase64) {
            buffer = Buffer.from(imageBase64, 'base64');
        } else if (fallbackImageUrl) {
            const response = await fetch(fallbackImageUrl);
            if (!response.ok) {
                throw new Error("Error fetching fallback image");
            }

            const contentTypeHeader = response.headers.get('content-type');
            contentType = contentTypeHeader || 'image/png';

            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            //return res.status(400).json({ error: 'No picture inputted' });
        }

        // Deduction of the extension from the MIME type
        const mimeToExt = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/svg+xml': 'svg',
            'image/webp': 'webp',
        };
        const fileExtension = mimeToExt[contentType] || 'png';
        const filename = `${pseudo}_avatar.${fileExtension}`;

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filename, buffer, {
                contentType,
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Supabase error :', error);
            return res.status(500).json({ error: 'Error while uploading image' });
        }

        return res.status(200).json({ message: 'Image successfully uploaded', data });
    } catch (error) {
        console.error('API error in uploadAvatar :', error);
        return res.status(500).json({ error: 'internal server error' });
    }
}
