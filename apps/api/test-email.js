
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Starting email test...');

    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT || '465');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    console.log(`Config: Host=${host}, Port=${port}, User=${user ? '***' : 'MISSING'}, Pass=${pass ? '***' : 'MISSING'}`);

    if (!user || !pass) {
        console.error('ERROR: SMTP credentials missing!');
        return;
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM || `"Test" <${user}>`,
            to: 'admin@saldanamusic.com', // Replace with a verified email if needed
            subject: 'Test Email from Server',
            text: 'If you receive this, SMTP is working.',
            html: '<b>SMTP Test Success</b>'
        });
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Email failed:', error);
    }
}

testEmail();
