//we use nodemailer

import nodemailer from "nodemailer";

const transport= nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
  }
});

type emailType= "verification" | "passwordResetting";

export const sendEmail= async(
        toEmail:    string,
        farmerName: string,
        type:       emailType,
        token:      string

): Promise<void>=>{
    const baseURL= process.env.FRONTEND_URL;

    const link = type === "verification"
    ? `${process.env.BACKEND_URL}/api/auth/verify-email/verify?token=${token}`
    : `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  
    const subject = type === "verification"
        ? "Verify your AgriSense email"
        : "Reset your AgriSense password";

    
    const text = type === "verification"
        ? `Hi ${farmerName},\n\nClick this link to verify your email:\n${link}\n\nThis link expires in 30 minutes.`
        : `Hi ${farmerName},\n\nClick this link to reset your password:\n${link}\n\nThis link expires in 1 hour.`;

    
    try{
        await transport.sendMail({
                from:    `"AgriSense" <${process.env.EMAIL_FROM}>`,
                to:      toEmail,
                subject,
                text
        });

        console.log(`${type} mail sent successfully to ${toEmail}`);
    }
    catch(error){
            console.error(`Failed to send ${type} email — to:${toEmail} error:${error}`);
            throw new Error("Failed to send email");
    }

    }