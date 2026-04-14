export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  body: string; // HTML body
  from?: string;
  attachments?: EmailAttachment[];
}

export interface IEmailStrategy {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
