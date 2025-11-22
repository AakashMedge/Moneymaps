import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
    console.log('Testing Resend API Key:', process.env.RESEND_API_KEY ? 'Found' : 'Missing');

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'delivered@resend.dev', // Test address
            subject: 'Welth Test Email',
            html: '<p>If you see this, Resend is working!</p>'
        });

        console.log('Email sent successfully:', data);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

sendTestEmail();
