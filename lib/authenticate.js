// lib/authenticate.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { serialize } from "cookie";
import supabase from "./supabaseClient";
import { handleDailyLogin } from "./userPointsUtils";

export async function authenticate(user, mdp) {
    // checking password by comparing the hash with the hashed password in the DB
    if (bcrypt.compareSync(mdp, user.password)) {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET undefined in .env !");
        }
        const secret = process.env.JWT_SECRET;

        const token = jwt.sign({ pseudo: user.pseudo, exp: Math.floor(Date.now() / 1000) + 3600 }, secret);

        // update user's date and add daily login points
        try {
            // Mettre à jour la date de connexion
            await supabase
                .from('User')
                .update({
                    dateOnline: moment().tz('Europe/Paris').format(),
                })
                .eq('pseudo', user.pseudo);
                
            // Gérer les points de connexion quotidienne et mise à jour du niveau
            const loginResult = await handleDailyLogin(user.pseudo);
            
            if (!loginResult.success) {
                console.error(`Error handling daily login for user ${user.pseudo}:`, loginResult.error);
            } else if (loginResult.isFirstLogin) {
                console.log(`Added ${loginResult.pointsAdded} daily login points to user ${user.pseudo}. New total: ${loginResult.newPoints}`);
                
                if (loginResult.levelUp) {
                    console.log(`User ${user.pseudo} leveled up to ${loginResult.newLevel} during login!`);
                }
            }
        } catch (error) {
            console.error("Error while updating user data:", error);
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