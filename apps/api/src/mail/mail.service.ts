import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'info@renace.space',
                pass: 'JustWork2027@',
            },
        });
    }

    async sendUserWelcome(email: string, name: string) {
        await this.transporter.sendMail({
            from: '"Saldaña Music" <info@renace.space>',
            to: email,
            subject: 'Welcome to Saldaña Music',
            text: `Hello ${name}, welcome to the platform for professional split sheets.`,
            html: `<b>Hello ${name},</b><br>Welcome to the platform for professional split sheets.`,
        });
    }

    async sendSignatureRequest(email: string, inviterName: string, splitSheetTitle: string, link: string) {
        await this.transporter.sendMail({
            from: '"Saldaña Music" <info@renace.space>',
            to: email,
            subject: `Signature Request: ${splitSheetTitle}`,
            html: `
        <h3>You have been invited to sign a Split Sheet</h3>
        <p>${inviterName} has added you as a collaborator on "<strong>${splitSheetTitle}</strong>".</p>
        <p>Please click below to review and sign:</p>
        <a href="${link}" style="background-color: #D4AF37; color: #fff; padding: 10px 20px; text-decoration: none;">Review & Sign</a>
      `,
        });
    }
}
