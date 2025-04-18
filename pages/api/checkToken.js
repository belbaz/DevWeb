import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import supabase from 'lib/supabaseClient';
import { serialize } from 'cookie';

export default async function checkToken(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({error: 'Méthode non autorisée'});
    }

    let token = null;

    try {
        if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.headers.cookie) {
            const cookies = cookie.parse(req.headers.cookie);
            token = cookies.TOKEN;
        }
    } catch (error) {
        console.error('Erreur lors du parsing des cookies:', error);
    }

    if (!token) {
        console.log('Aucun token trouvé');
        return res.status(401).json({error: 'Aucun token fourni', noToken: true});
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret);

        const {data: user} = await supabase
            .from('User')
            .select('isActive, pseudo')
            .ilike('pseudo', decoded.pseudo)
            .single();

        if (!user) {
            return res.status(404).json({error: 'Utilisateur non trouvé'});
        }

        if (user.isActive === false) {
            return res.status(200).json({valid: true, pseudo: decoded.pseudo, isActive: false});
        } else {
            return res.status(200).json({valid: true, pseudo: decoded.pseudo, isActive: true});
        }
    } catch (error) {
        console.error('Erreur de vérification du token:', error.message);
        res.setHeader('Set-Cookie', serialize('TOKEN', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        }));
        return res.status(401).json({error: 'Token invalide', invalidToken: true});
    }
}
