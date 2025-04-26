// pages/api/avatar.js
import { S3Client, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import checkUser from "./checkUser";
import Cookies from "js-cookie";
import { getUserFromRequest } from "../../lib/getUserFromRequest";

const s3 = new S3Client({
    region: "us-east-1",
    endpoint: "https://hnikkirrqjburrfrlhss.supabase.co/storage/v1/s3",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
        secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
    },
});

// returns signed url to access the avatar
// if not avatar found, returns default avatar signed url
export default async function handler(req, res) {
    const username = getUserFromRequest(req);

    if (!username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    // try every extension for the avatar
    for (const ext of ["png", "svg", "jpeg"]) {
        try {
            const fileName = `${username}_avatar.${ext}`;
            await s3.send(new HeadObjectCommand({ Bucket: "avatars", Key: fileName }));
            const url = await getSignedUrl(s3, new GetObjectCommand({
                Bucket: "avatars", Key: fileName
            }), { expiresIn: 86400 });
            return res.status(200).json({ url });
        } catch (e) {
            console.error(`Error fetching avatar for ${username}:`, e);
            return res.status(500).json({ error: "Internal server error while fetching avatar" });
        }
    }

    // default avatar
    try {
        const url = await getSignedUrl(s3, new GetObjectCommand({
            Bucket: "avatars", Key: "avatar.svg"
        }), { expiresIn: 86400 });
        return res.status(200).json({ url });
    } catch (e) {
        return res.status(500).json({ error: "Server error : unable to acces to default avatar" });
    }
}