// lib/authenticate.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "./supabaseClient";
import moment from "moment-timezone";
import {serialize} from "cookie";

export async function authenticate(user, mdp) {
    // console.log("Authenticate user : " + user.pseudo + " / " + user.password + " mdp : " + mdp);
    //vérification du mot de passer en comparant le hash avec le mdp hashé dans la BD
    if (bcrypt.compareSync(mdp, user.password)) {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET non défini dans le fichier .env !");
        }
        const secret = process.env.JWT_SECRET;

        const token = jwt.sign({pseudo: user.pseudo, exp: Math.floor(Date.now() / 1000) + 3600}, secret);

        // Définir l'utilisateur actuel dans Supabase
        await supabase.rpc('set_current_user', {pseudo: user.pseudo});

        // Mise à jour de la date d'User
        try {
            await supabase
                .from('User')
                .update({
                    dateOnline: moment().tz('Europe/Paris').format(),
                })
                .eq('pseudo', user.pseudo);
        } catch (error) {
            console.error("Erreur lors de l'update de dateOnline : ", error);
        }

        const cookie =
            serialize('TOKEN', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 3600,
                path: '/',
            });

        return {success: true, pseudo: user.pseudo, cookie};
    } else {
        return {success: false};
    }
}