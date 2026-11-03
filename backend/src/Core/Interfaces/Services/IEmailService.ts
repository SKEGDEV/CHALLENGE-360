export interface IEmailService {
  sendHtmlEmail(to: string, subject: string, html: string): Promise<void>;
}
