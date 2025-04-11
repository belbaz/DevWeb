// lib/sendMail.js
import CryptoJS from "crypto-js";
import nodemailer from 'nodemailer';

export async function sendMail(pseudo, email) {

    const cipherPseudo = CryptoJS.AES.encrypt(pseudo, process.env.JWT_SECRET_KEY).toString();
    const link = `https://musehome.vercel.app/active?token=${encodeURIComponent(cipherPseudo)}`;

    // Configuration de nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail', auth: {
            user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS
        }
    });

    // Template HTML
    const htmlTemplate = `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>Activation de votre compte MuseHome</title>
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                      background-color: #f9fafb;
                      font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
                      color: #333;
                    }
                    .container {
                      max-width: 600px;
                      margin: 40px auto;
                      background-color: #ffffff;
                      border-radius: 12px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                      padding: 40px 30px;
                      text-align: center;
                    }  
                    h1 {
                      color: #1e293b;
                      font-size: 26px;
                      margin-bottom: 20px;
                    }
                    p {
                      font-size: 16px;
                      line-height: 1.6;
                      margin: 10px 0;
                    }
                    a.button {
                      display: inline-block;
                      margin-top: 25px;
                      padding: 14px 30px;
                      font-size: 16px;
                      font-weight: bold;
                      color: #ffffff;
                      background-color: #2563eb;
                      border-radius: 8px;
                      text-decoration: none;
                      transition: background 0.3s ease;
                    }
                    a.button:hover {
                      background-color: #1d4ed8;
                    }
                    .footer {
                      margin-top: 40px;
                      font-size: 12px;
                      color: #94a3b8;
                    }
                    @media (max-width: 600px) {
                      .container {
                        padding: 30px 20px;
                      }
                      h1 {
                        font-size: 22px;
                      }
                      a.button {
                        font-size: 15px;
                        padding: 12px 24px;
                      }
                    }
                  </style>
                </head>
                    <body>
                        <div class="container">
                            <h1>Bienvenue sur MuseHome 🎉</h1>
                            <p>Bonjour <strong>${pseudo}</strong>,</p>
                            <p>Merci pour votre inscription sur <strong>MuseHome</strong>.</p>
                            <p>Pour activer votre compte et commencer votre expérience, cliquez sur le bouton ci-dessous :</p>
                            <a href="${link}" class="button">Activer mon compte</a>
                            <p style="margin-top: 25px;">Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.</p>
                            <div class="footer">
                                &copy; ${new Date().getFullYear()} MuseHome. Tous droits réservés.
                            </div>
                        </div>
                    </body>
                </html>
            `;

    // Envoi de l'email
    return await transporter.sendMail({
        from: `"NO-REPLY MuseHome" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Activation de votre compte MuseHome",
        html: htmlTemplate
    });
}