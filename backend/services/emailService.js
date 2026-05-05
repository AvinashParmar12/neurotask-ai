const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com' || !process.env.EMAIL_PASS) {
            console.error('ERROR: You must set EMAIL_USER and EMAIL_PASS in your .env file to use Google Gmail!');
            return false;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"NeuroTask Security" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Real Gmail successfully routed to:', to);
        console.log('Message ID:', info.messageId);

        return true;
    } catch (error) {
        console.error('Error sending Google Gmail:', error);
        return false;
    }
};

module.exports = { sendEmail };
