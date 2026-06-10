const nodemailer = require('nodemailer');

// Ethereal Email is a fake SMTP service, mostly aimed at Nodemailer users
// This allows us to test sending emails without needing real credentials
let transporter;

async function setupTransporter() {
  if (!transporter) {
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Use real Gmail account
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        console.log(`📧 Gmail SMTP configured with account: ${process.env.EMAIL_USER}`);
      } else {
        // Fallback to Ethereal Email for testing
        let testAccount = await nodemailer.createTestAccount();
        
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
        console.log(`📧 Ethereal Email fallback configured with account: ${testAccount.user}`);
      }
    } catch (err) {
      console.error('Failed to create Ethereal Email account', err);
    }
  }
  return transporter;
}

const sendVerificationEmail = async (email, token) => {
  try {
    const t = await setupTransporter();
    
    const defaultUrl = process.env.NODE_ENV === 'production' ? 'https://om-om-final.vercel.app' : 'http://localhost:5173';
    const frontendUrl = process.env.FRONTEND_URL || defaultUrl;
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    
    let info = await t.sendMail({
      from: '"OMOM Fitness" <noreply@omomfitness.app>',
      to: email,
      subject: "Підтвердження Email адреси",
      html: `
        <h1>Ласкаво просимо до OMOM!</h1>
        <p>Дякуємо за реєстрацію. Будь ласка, підтвердіть свою email адресу, перейшовши за посиланням нижче:</p>
        <a href="${verificationUrl}">Підтвердити Email</a>
        <p>Або скопіюйте це посилання у ваш браузер:</p>
        <p>${verificationUrl}</p>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    const t = await setupTransporter();
    
    const defaultUrl = process.env.NODE_ENV === 'production' ? 'https://om-om-final.vercel.app' : 'http://localhost:5173';
    const frontendUrl = process.env.FRONTEND_URL || defaultUrl;
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    
    let info = await t.sendMail({
      from: '"OMOM Fitness" <noreply@omomfitness.app>',
      to: email,
      subject: "Відновлення паролю",
      html: `
        <h1>Відновлення паролю</h1>
        <p>Ви отримали цей лист, оскільки був зроблений запит на відновлення паролю для вашого акаунту.</p>
        <p>Будь ласка, перейдіть за посиланням нижче, щоб встановити новий пароль:</p>
        <a href="${resetUrl}">Відновити пароль</a>
        <p>Якщо ви не робили цей запит, проігноруйте цей лист і ваш пароль залишиться незмінним.</p>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
