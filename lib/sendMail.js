// lib/sendMail.js
import nodemailer from 'nodemailer';
import { getActiveMail } from "./getActiveMail";
import { getResetMail } from "./getResetMail";
import { createToken } from "./createToken";

export async function sendMail(pseudo, email, isActivation) {

    const type = isActivation ? 'activation' : 'reset';
    const token = await createToken(pseudo, type);

    // Use localhost:3000 for development
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://musehome.vercel.app' 
        : 'http://localhost:3000';

    const link = isActivation
        ? `${baseUrl}/activation?token=${token}`
        : `${baseUrl}/reset?token=${token}`;

    // Log activation link in development mode
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🔗 DEV MODE - ${type.toUpperCase()} LINK: ${link}`);
    }

    // nodemailer config
    let transporter = nodemailer.createTransport({
        service: 'gmail', auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // send email
    return await transporter.sendMail({
        from: `"MuseHome" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: isActivation ? "Activation your Musehome account" : "Resetting your Musehome password",
        html: isActivation ? getActiveMail(pseudo, link) : getResetMail(pseudo, link)
    });
}