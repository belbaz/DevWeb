import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import {wait} from "next/dist/lib/wait";

export default async function checkToken(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({error: 'Méthode non autorisée'});
    }

    let token = null;

    // Vérifie si le token est présent dans l'en-tête Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else {
        // Vérifie si le token est dans les cookies
        const cookies = cookie.parse(req.headers.cookie || '');
        token = cookies.TOKEN;
    }

    if (!token) {
        return res.status(401).json({error: 'Non autorisé'});
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret);
        res.status(200).json({valid: true, pseudo: decoded.pseudo});
    } catch (error) {
        res.status(401).json({error: 'Token invalide'});
    }
}