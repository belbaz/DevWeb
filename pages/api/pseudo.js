import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.TOKEN; // Récupérer le token correctement

    if (!token) {
        return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
        const decoded = jwt.verify(token, 'secret_key');
        res.status(200).json({ pseudo: decoded.pseudo });
    } catch (error) {
        res.status(401).json({ error: 'Token invalide' });
    }
}
