// lib/authenticate.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { serialize } from "cookie";
import supabase from "./supabaseClient";

export async function authenticate(user, mdp) {
    // checking password by comparing the hash with the hashed password in the DB
    if (bcrypt.compareSync(mdp, user.password)) {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET undefined in .env !");
        }
        const secret = process.env.JWT_SECRET;

        const token = jwt.sign({ pseudo: user.pseudo, exp: Math.floor(Date.now() / 1000) + 3600 }, secret);

        // define the current user in Supabase
        await supabase.rpc('set_current_user', { pseudo: user.pseudo });

        // update user's date
        try {
            await supabase
                .from('User')
                .update({
                    dateOnline: moment().tz('Europe/Paris').format(),
                })
                .eq('pseudo', user.pseudo);
        } catch (error) {
            console.error("Error while updating dateOnline : ", error);
        }

        const cookie =
            serialize('TOKEN', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // mandatory for vercel
                sameSite: 'Strict',
                path: '/',
                maxAge: 60 * 60 * 24, // 1 day
            });

        return { success: true, pseudo: user.pseudo, cookie };
    } else {
        return { success: false };
    }
}