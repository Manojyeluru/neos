const nodemailer = require('nodemailer');

// Log email configuration for debugging at start
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('📬 Email Service Initializing:', { 
    hasUser: !!emailUser, 
    userPrefix: emailUser ? emailUser.substring(0, 4) : 'N/A',
    hasPass: !!emailPass 
});

if (!emailUser || !emailPass) {
    console.warn('⚠️ WARNING: Global Email credentials not configured in .env. Falling back only to event-specific settings or failure.');
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

const sendEmail = async (to, subject, html, eventEmailSettings = null) => {
    // If eventEmailSettings are provided (from database/event creation), use them
    let currentTransporter = transporter;
    let fromAccount = emailUser;

    if (eventEmailSettings && eventEmailSettings.user && eventEmailSettings.pass) {
        try {
            currentTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: eventEmailSettings.user,
                    pass: eventEmailSettings.pass
                }
            });
            fromAccount = eventEmailSettings.user;
        } catch (err) {
            console.error('❌ Failed to use event-specific email settings:', err.message);
            // Will fallback to default if desired or throw error
        }
    }

    if (!fromAccount || (!emailPass && !eventEmailSettings?.pass)) {
        const error = new Error('Email service not configured. Check EMAIL_USER and EMAIL_PASS in .env OR event settings.');
        console.error('📧 Email not sent to', to, ':', error.message);
        throw error;
    }

    try {
        const info = await currentTransporter.sendMail({
            from: `"Technical Event Team" <${fromAccount}>`,
            to,
            subject,
            html
        });
        console.log('✅ Email sent to:', to, '| From account:', fromAccount, '| ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email to', to, ':', error.message);
        throw error;
    }
};

module.exports = { sendEmail };

