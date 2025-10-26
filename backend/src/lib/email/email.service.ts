import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (!process.env.SMTP_USER || !smtpPassword) {
      console.warn(
        "Warning: SMTP credentials not configured. Email sending will fail."
      );
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: smtpPassword,
      },
    });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendOtpEmail(email: string, code: string): Promise<void> {
    const subject = "Your Verification Code";
    const text = `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p style="font-size: 16px; color: #666;">Use this code to verify your email:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
          ${code}
        </div>
        <p style="font-size: 14px; color: #999;">This code will expire in 15 minutes.</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = "Welcome to University Management System";
    const text = `Hi ${firstName},\n\nWelcome to our system!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome, ${firstName}!</h2>
        <p style="font-size: 16px; color: #666;">Thank you for joining our system.</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }
}

const emailService = new EmailService();
export default emailService;
