import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    private readonly from: string;
    private readonly replyTo?: string;
    private readonly bcc?: string;
    private readonly webUrl: string;

    constructor() {
        const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
        this.transporter = nodemailer.createTransport({
            host,
            port: parseInt(process.env.SMTP_PORT || '465', 10),
            secure: process.env.SMTP_SECURE !== 'false',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const brandName = process.env.MAIL_BRAND_NAME || 'Saldaña Music';
        const fromEmail = process.env.MAIL_FROM_EMAIL || 'info@renace.space';
        this.from = process.env.MAIL_FROM || `"${brandName}" <${fromEmail}>`;
        this.replyTo = process.env.MAIL_REPLY_TO || undefined;
        this.bcc = process.env.MAIL_BCC || undefined;
        this.webUrl = process.env.APP_WEB_URL || 'https://app.saldanamusic.com';

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ SMTP credentials not configured. Email sending will fail.');
        }
    }

    private escapeHtml(input: string) {
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    private renderTemplate(params: { title: string; preheader: string; bodyHtml: string; cta?: { label: string; url: string } }) {
        const title = this.escapeHtml(params.title);
        const preheader = this.escapeHtml(params.preheader);
        const cta = params.cta
            ? `
              <div style="margin:28px 0 10px; text-align:center;">
                <a href="${params.cta.url}" style="display:inline-block; background:#D4AF37; color:#000; padding:12px 18px; border-radius:10px; font-weight:700; letter-spacing:0.02em; text-decoration:none;">${this.escapeHtml(params.cta.label)}</a>
              </div>
            `
            : '';

        return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background:#0b0b0b; color:#ffffff; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b; padding:24px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background:#121212; border:1px solid rgba(212,175,55,0.18); border-radius:16px; overflow:hidden;">
            <tr>
              <td style="padding:18px 22px; border-bottom:1px solid rgba(212,175,55,0.12);">
                <div style="font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:#D4AF37; font-size:13px;">Saldaña Music</div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px;">
                <h1 style="margin:0 0 10px; font-size:20px; line-height:1.35;">${title}</h1>
                <div style="font-size:14px; line-height:1.65; color:#d1d5db;">${params.bodyHtml}</div>
                ${cta}
                <div style="margin-top:18px; font-size:12px; line-height:1.5; color:#9ca3af;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                  <span style="word-break:break-all;">${params.cta ? params.cta.url : this.webUrl}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 22px; border-top:1px solid rgba(212,175,55,0.12); font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} Saldaña Music
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }

    private async send(params: { to: string; subject: string; text: string; html: string }) {
        const mailOptions: nodemailer.SendMailOptions = {
            from: this.from,
            to: params.to,
            subject: params.subject,
            text: params.text,
            html: params.html,
        };
        if (this.replyTo) mailOptions.replyTo = this.replyTo;
        if (this.bcc) mailOptions.bcc = this.bcc;

        const info = await this.transporter.sendMail(mailOptions);
        console.log(`Mail sent to=${params.to} subject="${params.subject}" messageId=${info.messageId}`);
        return info;
    }

    async sendUserWelcome(email: string, name: string) {
        const safeName = name || 'Usuario';
        const subject = 'Bienvenido a Saldaña Music';
        const text = `Hola ${safeName},\n\nBienvenido a Saldaña Music. Ya puedes gestionar tus split sheets y colaboraciones desde: ${this.webUrl}`;
        const html = this.renderTemplate({
            title: subject,
            preheader: `Bienvenido, ${safeName}. Tu cuenta está lista.`,
            bodyHtml: `Hola <strong>${this.escapeHtml(safeName)}</strong>,<br /><br />
              Bienvenido a Saldaña Music. Ya puedes gestionar tus split sheets, colaboraciones y firmas desde tu panel.`,
            cta: { label: 'Ir al Panel', url: `${this.webUrl}/dashboard` },
        });
        await this.send({ to: email, subject, text, html });
    }

    async sendSignatureRequest(email: string, inviterName: string, splitSheetTitle: string, link: string) {
        const subject = `Solicitud de Firma: ${splitSheetTitle}`;
        const text = `${inviterName} te invitó a firmar el split sheet "${splitSheetTitle}".\n\nRevisa y firma aquí: ${link}`;
        const html = this.renderTemplate({
            title: subject,
            preheader: `Firma requerida: ${splitSheetTitle}`,
            bodyHtml: `${this.escapeHtml(inviterName)} te añadió como colaborador en <strong>${this.escapeHtml(splitSheetTitle)}</strong>.<br /><br />
              Revisa los porcentajes y firma el acuerdo cuando estés listo.`,
            cta: { label: 'Revisar y Firmar', url: link },
        });
        await this.send({ to: email, subject, text, html });
    }

    async sendPasswordReset(email: string, resetLink: string) {
        const subject = 'Restablecer Contraseña - Saldaña Music';
        const text = `Solicitaste restablecer tu contraseña.\n\nUsa este enlace: ${resetLink}\n\nSi no fuiste tú, ignora este correo.`;
        const html = this.renderTemplate({
            title: subject,
            preheader: 'Solicitud de restablecimiento de contraseña',
            bodyHtml: `Recibimos una solicitud para restablecer tu contraseña.<br /><br />
              Si fuiste tú, continúa con el enlace. Si no, puedes ignorar este correo.`,
            cta: { label: 'Restablecer Contraseña', url: resetLink },
        });
        await this.send({ to: email, subject, text, html });
    }

    async sendSplitSheetCompleted(email: string, splitSheetTitle: string, downloadLink: string) {
        const subject = `Split Sheet Completado: ${splitSheetTitle}`;
        const text = `¡Split Sheet completado!\n\nTodos los colaboradores han firmado "${splitSheetTitle}".\n\nAccede aquí: ${downloadLink}`;
        const html = this.renderTemplate({
            title: subject,
            preheader: `Completado: ${splitSheetTitle}`,
            bodyHtml: `Todos los colaboradores han firmado <strong>${this.escapeHtml(splitSheetTitle)}</strong>.`,
            cta: { label: 'Ver Documento', url: downloadLink },
        });
        await this.send({ to: email, subject, text, html });
    }

    async sendCollaboratorInvite(email: string, inviterName: string, splitSheetTitle: string, inviteLink: string) {
        const subject = `Invitación a Colaborar: ${splitSheetTitle}`;
        const text = `${inviterName} te invitó a colaborar en "${splitSheetTitle}".\n\nAcepta la invitación aquí: ${inviteLink}`;
        const html = this.renderTemplate({
            title: subject,
            preheader: `Invitación: ${splitSheetTitle}`,
            bodyHtml: `${this.escapeHtml(inviterName)} te invitó a unirte como colaborador en <strong>${this.escapeHtml(splitSheetTitle)}</strong>.`,
            cta: { label: 'Aceptar Invitación', url: inviteLink },
        });
        await this.send({ to: email, subject, text, html });
    }
}
