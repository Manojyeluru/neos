const nodemailer = require('nodemailer');

// Log email configuration for debugging
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
    console.warn('⚠️ WARNING: Email credentials not configured. Email sending will fail.');
    console.warn('Please set EMAIL_USER and EMAIL_PASS in .env file');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

// Test the transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service configuration error:', error.message);
        console.error('Please verify:');
        console.error('1. EMAIL_USER and EMAIL_PASS are set in .env');
        console.error('2. Using Gmail app password (not regular password)');
        console.error('3. Gmail account has less secure apps enabled');
    } else {
        console.log('✅ Email service is ready');
    }
});

const sendEmail = async (to, subject, html) => {
    if (!emailUser || !emailPass) {
        const error = new Error('Email service not configured. Check EMAIL_USER and EMAIL_PASS in .env');
        console.error('📧 Email not sent to', to, ':', error.message);
        throw error;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Technical Event Review" <${emailUser}>`,
            to,
            subject,
            html
        });
        console.log('✅ Email sent to:', to, '| Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email to', to, ':', error.message);
        throw error;
    }
};

module.exports = { sendEmail };

