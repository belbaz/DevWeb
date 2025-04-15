export function getResetMail(pseudo, link) {
    const year = new Date().getFullYear();
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Réinitialisation de mot de passe</title>
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
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    padding: 40px 30px;
                    text-align: center;
                }
        
                h1 {
                    color: #1e293b;
                    font-size: 24px;
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
            <h1>Réinitialisation de votre mot de passe 🔐</h1>
            <p>Bonjour <strong>${pseudo}</strong>,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe MuseHome.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <a href="${link}" class="button">Réinitialiser mon mot de passe</a>
            <p style="margin-top: 25px;">Si vous n'avez pas fait cette demande, ignorez simplement cet e-mail.</p>
            <div class="footer">
                &copy; ${year} MuseHome. Tous droits réservés.
            </div>
        </div>
        </body>
        </html>
    `;
}
