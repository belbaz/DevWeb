export function getActiveMail(pseudo, link) {
    const year = new Date().getFullYear();

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Activate Your MuseHome Account</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Roboto:wght@300;400;500&display=swap');
                
                body { 
                    margin: 0; 
                    padding: 0; 
                    background-color: #111111; 
                    font-family: 'Roboto', 'Helvetica Neue', sans-serif; 
                    color: #ffffff;
                    line-height: 1.6;
                }
                
                .container { 
                    max-width: 600px; 
                    margin: 40px auto; 
                    background-color: #000000; 
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
                    padding: 0;
                }
                
                .header {
                    padding: 30px 0;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .logo {
                    font-family: 'Cinzel', serif;
                    font-size: 32px;
                    letter-spacing: 4px;
                    color: #ffffff;
                    font-weight: 400;
                    margin: 0;
                }
                
                .content {
                    padding: 40px 40px;
                    text-align: center;
                }
                
                h1 { 
                    font-family: 'Cinzel', serif;
                    color: #ffffff; 
                    font-size: 24px; 
                    margin-bottom: 25px; 
                    font-weight: 400;
                    letter-spacing: 2px;
                }
                
                p { 
                    font-size: 16px; 
                    margin: 15px 0; 
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .button { 
                    display: inline-block; 
                    margin-top: 30px;
                    margin-bottom: 30px;
                    padding: 16px 40px; 
                    font-size: 14px; 
                    font-weight: 400; 
                    color: #000000; 
                    background-color: #ffffff; 
                    text-decoration: none; 
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    transition: background 0.3s ease;
                    border: none;
                }
                
                .note {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-top: 30px;
                }
                
                .footer { 
                    margin-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 20px 0;
                    font-size: 12px; 
                    color: rgba(255, 255, 255, 0.5);
                    text-align: center;
                }
                
                @media (max-width: 600px) {
                    .container { 
                        width: 100%; 
                        margin: 0;
                    }
                    .content {
                        padding: 30px 20px;
                    }
                    h1 { 
                        font-size: 22px; 
                    }
                    .button { 
                        padding: 14px 30px;
                        font-size: 13px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo">MUSEHOME</h1>
                </div>
                
                <div class="content">
                    <h1>Account Activation</h1>
                    
                    <p>Hello <strong>${pseudo}</strong>,</p>
                    
                    <p>Thank you for joining MUSEHOME.</p>
                    
                    <p>To activate your account and begin your journey with us, please click the button below:</p>
                    
                    <a href="${link}" class="button">ACTIVATE ACCOUNT</a>
                    
                    <p class="note">⚠️ This activation link is valid for 1 hour.</p>
                    
                    <p class="note">If you did not create this account, please disregard this email.</p>
                </div>
                
                <div class="footer">
                    © ${year} MUSEHOME. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `;
}
