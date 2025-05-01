import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';
import supabase from 'lib/supabaseClient';
import {getUserFromRequest} from 'lib/getUserFromRequest';

// checks if user is logged in and active
export default async function checkUser(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
    const user = await getUserFromRequest(req);
    const username = user?.pseudo;
    // console.log(username);
    if (!username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const cookies = parse(req.headers.cookie);
    const token = cookies.TOKEN;

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ error: "server error : JWT_SECRET undefined" });
        }
        const decoded = jwt.verify(token, secret);

        const { data: user } = await supabase
            .from('User')
            .select('isActive, pseudo, level, points, role , gender, birthday, address')
            .ilike('pseudo', decoded.pseudo)
            .single();

        if (!user) {
            // delete token when its age is 0
            res.setHeader('Set-Cookie', serialize('TOKEN', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 0,
                path: '/',
            }));
            return res.status(404).json({ error: 'user not found' });
        }

        if (user.isActive === false) {
            return res.status(200).json({
                valid: true,
                pseudo: decoded.pseudo,
                isActive: false,
                level: user.level,
                point: user.pointsss,
                role: user.role,
                gender: user.gender,
                birthday: user.birthday,
                address: user.address
            });
        } else {
            return res.status(200).json({
                valid: true,
                pseudo: decoded.pseudo,
                isActive: true,
                level: user.level,
                point: user.pointsss,
                role: user.role,
                gender: user.gender,
                birthday: user.birthday,
                address: user.address
            });
        }
    } catch (error) {
        console.error('error while checking token :', error?.message);
        // delete token when its age is 0
        res.setHeader('Set-Cookie', serialize('TOKEN', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        }));
        return res.status(401).json({ error: 'invalid token', invalidToken: true });
    }
}
