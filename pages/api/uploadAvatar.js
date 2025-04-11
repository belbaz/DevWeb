// pages/api/uploadAvatar.js
import supabase from '/lib/supabaseClient';
import fetch from 'node-fetch';

export default async function uploadAvatar(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { pseudo, imageBase64, fallbackImageUrl } = req.body;

    if (!pseudo) {
        return res.status(400).json({ error: 'Le pseudo est requis' });
    }

    try {
        let buffer;
        let contentType = 'image/png'; // valeur par défaut

        if (imageBase64) {
            buffer = Buffer.from(imageBase64, 'base64');
            // Astuce pour déduire le type si tu veux : mais ici on garde png par défaut pour base64
        } else if (fallbackImageUrl) {
            const response = await fetch(fallbackImageUrl);
            if (!response.ok) {
                throw new Error("Erreur lors du téléchargement de l'image de fallback");
            }

            const contentTypeHeader = response.headers.get('content-type');
            contentType = contentTypeHeader || 'image/png';

            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            //return res.status(400).json({ error: 'Aucune image fournie' });
        }

        // Déduction de l'extension à partir du type MIME
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
            console.error('Erreur Supabase :', error);
            return res.status(500).json({ error: 'Erreur lors de l’upload' });
        }

        return res.status(200).json({ message: 'Image uploadée', data });
    } catch (error) {
        console.error('Erreur API uploadAvatar :', error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}
