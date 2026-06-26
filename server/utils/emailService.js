

import nodemailer from 'nodemailer';

let transporter;

const initializeTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  } else {
    
    console.log('📧 Setting up Ethereal test email server...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 Ethereal account ready! Sending from ${testAccount.user}`);
  }
};

let transporterPromise = null;

const getTransporter = () => {
  if (!transporterPromise) {
    transporterPromise = initializeTransporter();
  }
  return transporterPromise;
};

export const sendEmail = async ({ to, subject, html }) => {
  await getTransporter();

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER ? `"FinTrack" <${process.env.EMAIL_USER}>` : '"FinTrack" <noreply@fintrack.app>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n📧 Email sent to ${to} — Message ID: ${info.messageId}`);

    if (!process.env.EMAIL_USER) {
      console.log(`🔗 Preview your actual email here: ${nodemailer.getTestMessageUrl(info)}\n`);
    }

    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw new Error('Email could not be sent');
  }
};

export const sendPasswordResetEmail = async (email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f7; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6); padding:32px 40px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700;">FinTrack</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:36px 40px; text-align:center;">
                  <h2 style="margin:0 0 16px; color:#1f2937; font-size:20px;">Password Reset Request</h2>
                  <p style="color:#4b5563; font-size:15px; line-height:1.6; margin:0 0 24px; text-align:left;">
                    We received a request to reset the password for your FinTrack account.
                    Enter the 6-digit code below into the application to choose a new password. This code is valid for
                    <strong>10 minutes</strong>.
                  </p>
                  
                  <div style="background:#f3f4f6; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 24px; margin: 0 auto 24px;">
                    <span style="font-family: monospace; font-size: 32px; font-weight: 700; color: #4f46e5; letter-spacing: 4px;">${otp}</span>
                  </div>
                  
                  <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
                  <p style="color:#9ca3af; font-size:12px; line-height:1.5; margin:0; text-align:left;">
                    If you didn't request a password reset, you can safely ignore this email.
                    Your password will remain unchanged.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb; padding:20px 40px; text-align:center;">
                  <p style="color:#9ca3af; font-size:12px; margin:0;">
                    &copy; ${new Date().getFullYear()} FinTrack. All rights reserved.
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

  return sendEmail({
    to: email,
    subject: 'FinTrack — Your Password Reset Code',
    html,
  });
};
