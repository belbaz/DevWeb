// lib/sendMail.js
import nodemailer from 'nodemailer';
import {getActiveMail} from "./getActiveMail";
import {getResetMail} from "./getResetMail";
import {createToken} from "./createToken";

export async function sendMail(pseudo, email, isActivation) {

    const type = isActivation ? 'activation' : 'reset';
    const token = await createToken(pseudo, type);

    const link = isActivation
        ? `https://musehome.vercel.app/activation?token=${token}`
        : `https://musehome.vercel.app/reset?token=${token}`;

    // Configuration de nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail', auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Envoi de l'email
    return await transporter.sendMail({
        from: `"MuseHome" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: isActivation ? "Activation de votre compte MuseHome" : "Réinitialisation de votre mot de passe MuseHome",
        html: isActivation ? getActiveMail(pseudo, link) : getResetMail(pseudo, link)
    });
}