// lib/getUserFromRequest.js
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export function getUserFromRequest(req) {
    let token = null;

    if (req.headers.cookie) {
        const cookies = parse(req.headers.cookie);
        token = cookies.TOKEN;
    }

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        return decoded.pseudo;
    } catch (err) {
        console.error('JWT Error:', err.message);
        return null;
    }
}
