import nodemailer, { Transporter } from 'nodemailer';
import { IEmailService } from '@Core';

export interface SmtpCredentials {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromAddress: string;
  fromName: string;
}

export class SmtpEmailService implements IEmailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly credentials: SmtpCredentials) {
    this.transporter = nodemailer.createTransport({
      host: credentials.host,
      port: credentials.port,
      secure: credentials.port === 465,
      auth: { user: credentials.user, pass: credentials.pass },
    });
    this.from = `"${credentials.fromName}" <${credentials.fromAddress}>`;
  }

  async sendHtmlEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }
}
