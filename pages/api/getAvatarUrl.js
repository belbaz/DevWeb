// pages/api/getAvatarUrl.js

import { parse } from 'cookie';
import { S3Client, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
    region: 'us-east-1',
    endpoint: 'https://hnikkirrqjburrfrlhss.supabase.co/storage/v1/s3',
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
        secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
    },
});

export default async function handler(req, res) {
    try {
        // 1. Récupérer le token soit dans l'Authorization, soit dans les cookies
        const cookies = parse(req.headers.cookie || '');
        const token = req.headers.authorization?.split(' ')[1] || cookies.TOKEN;
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        // 2. Appel interne à checkToken pour valider le token et récupérer le pseudo
        const host = req.headers.host; // ex: "musehome.vercel.app"
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const baseURL = `${protocol}://${host}`;

        const checkRes = await fetch(`${baseURL}/api/checkToken`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
        const tokenData = await checkRes.json();
        if (!checkRes.ok) {
            return res.status(401).json({ error: tokenData.error || 'Token invalide' });
        }
        const { pseudo } = tokenData;

        // 3. Recherche du fichier avatar sur Supabase S3
        for (const ext of ['png', 'svg', 'jpeg']) {
            try {
                const key = `${pseudo}_avatar.${ext}`;
                await s3.send(new HeadObjectCommand({ Bucket: 'avatars', Key: key }));
                const url = await getSignedUrl(
                    s3,
                    new GetObjectCommand({ Bucket: 'avatars', Key: key }),
                    { expiresIn: 86400 }
                );
                return res.status(200).json({ url });
            } catch {
                // si le HeadObject échoue, on passe à l'extension suivante
            }
        }

        // 4. Avatar par défaut si rien trouvé
        const defaultUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({ Bucket: 'avatars', Key: 'avatar.svg' }),
            { expiresIn: 86400 }
        );
        return res.status(200).json({ url: defaultUrl });

    } catch (err) {
        console.error('🔥 Erreur getAvatarUrl:', err);
        return res.status(500).json({ error: err.message || 'Erreur interne' });
    }
}