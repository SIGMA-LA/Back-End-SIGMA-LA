export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  body: string; // HTML body
  from?: string;
}

export interface IEmailStrategy {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
