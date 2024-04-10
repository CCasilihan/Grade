const express = require('express');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const app = express();
app.use(express.json());

// Store OTPs in memory
const otps = {};

app.post('/send-email', async (req, res) => {
    const { email } = req.body;

    // Generate a 6-digit OTP
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

    // Store the OTP associated with the email
    otps[email] = otp;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'otpsender248@gmail.com',
            pass: 'tuiywbfiokjdmjgz'
        }
    });

    const mailOptions = {
        from: 'otpsender248@gmail.com',
        to: email,
        subject: 'Your OTP',
        text: `Your OTP is ${otp}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent');
        }
    });
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    // Check if the OTP matches the stored OTP
    if (otps[email] === otp) {
        res.status(200).send('OTP is valid');
    } else {
        res.status(400).send('OTP is invalid');
    }
});

module.exports = app;