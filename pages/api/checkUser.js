import jwt from 'jsonwebtoken';
import {parse, serialize} from 'cookie';
import supabase from 'lib/supabaseClient';
import {getUserFromRequest} from "../../lib/getUserFromRequest";

export default async function checkUser(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Méthode non autorisée'});
    }
    const pseudo = getUserFromRequest(req);

    if (!pseudo) {
        return res.status(401).json({error: 'Aucun token fourni', noToken: true});
    }

    const cookies = parse(req.headers.cookie);
    const token = cookies.TOKEN;

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET n'est pas défini !");
            return res.status(500).json({error: "JWT secret manquant côté serveur"});
        }
        const decoded = jwt.verify(token, secret);

        const {data: user} = await supabase
            .from('User')
            .select('isActive, pseudo, level, point, role')
            .ilike('pseudo', decoded.pseudo)
            .single();

        if (!user) {
            //suppression du token avec un age = 0
            res.setHeader('Set-Cookie', serialize('TOKEN', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 0,
                path: '/',
            }));
            return res.status(404).json({error: 'Utilisateur non trouvé'});
        }

        if (user.isActive === false) {
            return res.status(200).json({
                valid: true,
                pseudo: decoded.pseudo,
                isActive: false,
                level: user.level,
                point: user.point,
                role: user.role
            });
        } else {
            return res.status(200).json({
                valid: true,
                pseudo: decoded.pseudo,
                isActive: true,
                level: user.level,
                point: user.point,
                role: user.role
            });
        }
    } catch (error) {
        console.error('Erreur de vérification du token:', error.message);
        //suppression du token avec un age = 0
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
