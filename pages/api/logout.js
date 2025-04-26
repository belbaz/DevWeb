import { serialize } from 'cookie';

export default function logout(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send(`Method ${req.method} Not Allowed`);
    }

    res.setHeader('Set-Cookie', serialize('TOKEN', '', {
        httpOnly: true,
        secure: process.env.PROJECT_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0), // expires immediately
        path: '/',
    }));

    res.status(200).json({ success: true, message: 'successfully disconnected' });
}
