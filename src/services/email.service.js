require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/*Welcome Response*/

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Backend Ledger! 🎉';
  
  const text = `Hi ${name},\n\nWelcome to Backend Ledger!\n\nYour account has been created successfully.\n\nBest regards,\nThe Backend Ledger Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color:#2c3e50; padding:30px; text-align:center;">
                    <h1 style="color:#ffffff; margin:0; font-size:24px;">Backend Ledger</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 30px;">
                    <h2 style="color:#2c3e50; margin-top:0;">Hey ${name}, welcome aboard! 👋</h2>
                    <p style="color:#555; line-height:1.6;">
                      Your account has been successfully created. We're glad to have you with us.
                    </p>
                    <p style="color:#555; line-height:1.6;">
                      You can now log in and start managing your finances with Backend Ledger.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align:center; margin: 30px 0;">
                      <a href="http://localhost:3000" 
                         style="background-color:#2c3e50; color:#ffffff; padding:12px 30px; 
                                text-decoration:none; border-radius:5px; font-size:16px;">
                        Get Started
                      </a>
                    </div>

                    <p style="color:#555; line-height:1.6;">
                      If you didn't create this account, please ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f4f4f4; padding:20px; text-align:center;">
                    <p style="color:#999; font-size:12px; margin:0;">
                      © 2026 Backend Ledger. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendEmail(userEmail, subject, text, html);
}






module.exports = {
    sendRegistrationEmail
};