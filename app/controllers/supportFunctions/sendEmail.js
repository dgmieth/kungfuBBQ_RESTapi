//node modules
const fs = require('fs')
const path = require('path')
//npm modules
const nodemailer = require('nodemailer');
const ejs = require('ejs')

const sendEmail = async (email, subject, payload, template)=> {
    console.log(email)
    console.log(subject)
    console.log(payload)
    try {
        const transporter = nodemailer.createTransport({
            service:"SendinBlue", // no need to set host or port etc.
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
        const source = fs.readFileSync(path.join(__dirname, '../../../views/passwordRecoveryEmail.ejs'),"utf8")
        console.log(source)
        const compiledTemplate = ejs.compile(source)
        const options = () => {
            return {
                from: process.env.MAIL_SENDER,
                to: email,
                subject: subject,
                html: compiledTemplate(payload)
            };
            };
        transporter.sendMail(options(), (error, info) => {
        if (error) {
            console.log(error)
            return error;
        } else {
            return res.status(200).json({
            success: true,
            });
        }
        });
    } catch (error) {
        console.log(error)
        return error;
    }
}
module.exports = sendEmail