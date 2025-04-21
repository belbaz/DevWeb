// pages/api/avatar.js
import {S3Client, HeadObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import checkToken from "./checkToken";
import Cookies from "js-cookie";

const s3 = new S3Client({
    region: "us-east-1",
    endpoint: "https://hnikkirrqjburrfrlhss.supabase.co/storage/v1/s3",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
        secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
    },
});

export default async function handler(req, res) {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.TOKEN;

    if (!token) {
        return res.status(401).json({error: 'Token manquant'});
    }

    // Appel à checkToken pour récupérer le pseudo
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkToken`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,  // Envoie le token dans l'en-tête Authorization
        },
    });

    const tokenData = await response.json();

    if (tokenData.error) {
        return res.status(401).json({error: tokenData.error}); // Renvoie l'erreur si le token est invalide
    }

    const {pseudo} = tokenData;

    // Essayer chaque extension pour l'avatar personnalisé
    for (const ext of ["png", "svg", "jpeg"]) {
        try {
            const fileName = `${pseudo}_avatar.${ext}`;
            await s3.send(new HeadObjectCommand({Bucket: "avatars", Key: fileName}));
            const url = await getSignedUrl(s3, new GetObjectCommand({
                Bucket: "avatars", Key: fileName
            }), {expiresIn: 86400});
            return res.status(200).json({url});
        } catch (e) {
            // Essayer la prochaine extension
        }
    }

    // Avatar par défaut
    try {
        const url = await getSignedUrl(s3, new GetObjectCommand({
            Bucket: "avatars", Key: "avatar.svg"
        }), {expiresIn: 86400});
        return res.status(200).json({url});
    } catch (e) {
        return res.status(500).json({error: "Avatar par défaut inaccessible"});
    }
}