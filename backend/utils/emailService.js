const nodemailer = require("nodemailer");

const sendPasswordResetEmail = async (email, resetToken, name) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Havenix" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request - Havenix",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; background: #F5F0E8; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 2px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 400; color: #1E1C18; margin-bottom: 10px; }
          h1 em { font-style: italic; color: #8B7355; }
          p { color: #6B6355; line-height: 1.6; font-size: 15px; }
          .btn { display: inline-block; background: #8B7355; color: #F5F0E8; text-decoration: none; padding: 14px 32px; border-radius: 2px; font-size: 14px; letter-spacing: 0.5px; margin: 20px 0; font-weight: 500; }
          .btn:hover { background: #7A6445; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(139,115,85,0.1); font-size: 13px; color: #A89880; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Havenix <em>Password Reset</em></h1>
          <p>Hello ${name || 'User'},</p>
          <p>We received a request to reset your password for your Havenix account. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 13px; color: #8B7355;">${resetUrl}</p>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request this, you can safely ignore this email.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Havenix. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log("✅ Password reset email sent to:", email);
  console.log("📧 Message ID:", info.messageId);
  
  return info;
};

module.exports = { sendPasswordResetEmail };