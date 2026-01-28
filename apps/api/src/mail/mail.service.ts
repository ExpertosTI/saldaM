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
