//we use nodemailer

import nodemailer from "nodemailer";

const transport= nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
  }
});

type emailType= "verification" | "passwordResetting";

export const sendEmail= async(
        toEmail:    string,
        farmerName: string,
        type:       emailType,
        token:      string

): Promise<void>=>{
    const baseURL= process.env.FRONTEND_URL

}