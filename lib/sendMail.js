// lib/sendMail.js
import CryptoJS from "crypto-js";
import nodemailer from 'nodemailer';
import {getActiveMail} from "./getActiveMail";
import {getResetMail} from "./getResetMail";

export async function sendMail(pseudo, email, active) {

    const cipherPseudo = CryptoJS.AES.encrypt(pseudo, process.env.JWT_SECRET_KEY).toString();
    const linkActive = `https://musehome.vercel.app/active?token=${encodeURIComponent(cipherPseudo)}`;
    const linkReset = `https://musehome.vercel.app/reset?token=${encodeURIComponent(cipherPseudo)}`;
    // Configuration de nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail', auth: {
            user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS
        }
    });

    // Envoi de l'email
    return await transporter.sendMail({
        from: `"NO-REPLY MuseHome" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: active ? "Activation de votre compte MuseHome" : "Réinitialisation de votre mot de passe MuseHome",
        html: active ? getActiveMail(pseudo, linkActive) : getResetMail(pseudo, linkReset)
    });
}