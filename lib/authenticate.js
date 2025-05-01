// lib/authenticate.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { serialize } from "cookie";
import supabase from "./supabaseClient";

/**
 * Ajoute des points à l'utilisateur s'il se connecte pour la première fois de la journée
 * @param {string} pseudo - Le pseudonyme de l'utilisateur
 */
async function handleDailyLoginPoints(pseudo) {
  try {
    // Récupérer les données de l'utilisateur
    const { data: userData, error: fetchError } = await supabase
      .from('User')
      .select('lastLogin, pointsss')
      .eq('pseudo', pseudo)
      .single();

    if (fetchError || !userData) {
      console.error("Error fetching user data for daily login points:", fetchError);
      return;
    }

    const now = moment().tz('Europe/Paris');
    const lastLogin = userData.lastLogin ? moment(userData.lastLogin).tz('Europe/Paris') : null;

    // Vérifier si c'est la première connexion du jour
    const isNewDay = !lastLogin || !now.isSame(lastLogin, 'day');

    if (isNewDay) {
      // C'est la première connexion du jour, ajouter 5 points
      const currentPoints = userData.pointsss || 0;
      const newPoints = currentPoints + 5;

      // Mettre à jour les points et la date de dernière connexion
      const { error: updateError } = await supabase
        .from('User')
        .update({
          pointsss: newPoints,
          lastLogin: now.format()
        })
        .eq('pseudo', pseudo);

      if (updateError) {
        console.error("Error updating daily login points:", updateError);
      } else {
        console.log(`Added 5 daily login points to user ${pseudo}. New total: ${newPoints}`);
      }
    } else {
      // Mettre à jour seulement la date de dernière connexion
      const { error: updateError } = await supabase
        .from('User')
        .update({ lastLogin: now.format() })
        .eq('pseudo', pseudo);

      if (updateError) {
        console.error("Error updating last login date:", updateError);
      }
    }
  } catch (error) {
    console.error("Error processing daily login points:", error);
  }
}

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
                    dateOnline: moment().format(),
                })
                .eq('pseudo', user.pseudo);

            // Gérer les points de connexion quotidienne
            await handleDailyLoginPoints(user.pseudo);

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