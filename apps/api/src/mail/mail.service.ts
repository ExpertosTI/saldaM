import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.SMTP_PORT || '465', 10),
            secure: process.env.SMTP_SECURE !== 'false',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ SMTP credentials not configured. Email sending will fail.');
        }
    }

    async sendUserWelcome(email: string, name: string) {
        await this.transporter.sendMail({
            from: '"Saldaña Music" <info@renace.space>',
            to: email,
            bcc: 'expertostird@gmail.com', // Master User Notification
            subject: 'Bienvenido a Saldaña Music',
            text: `Hola ${name}, bienvenido a la plataforma profesional para gestión de derechos.`,
            html: `<b>Hola ${name},</b><br>Bienvenido a la plataforma profesional para gestión de derechos.`,
        });
    }

    async sendSignatureRequest(email: string, inviterName: string, splitSheetTitle: string, link: string) {
        await this.transporter.sendMail({
            from: '"Saldaña Music" <info@renace.space>',
            to: email,
            bcc: 'expertostird@gmail.com', // Master User Notification
            subject: `Solicitud de Firma: ${splitSheetTitle}`,
            html: `
        <h3>Has sido invitado a firmar un Split Sheet</h3>
        <p>${inviterName} te ha añadido como colaborador en "<strong>${splitSheetTitle}</strong>".</p>
        <p>Por favor haz clic abajo para revisar y firmar:</p>
        <a href="${link}" style="background-color: #D4AF37; color: #fff; padding: 10px 20px; text-decoration: none;">Revisar y Firmar</a>
      `,
        });
    }
}
