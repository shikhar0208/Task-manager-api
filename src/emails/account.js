const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'shikharrastogi36@gmail.com',
        subject: 'Thanks for joining in!',
        // we can only use this template string with right tick and not with single and double quotes
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.` // the way to concatinate variable and a string
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'shikharrastogi36@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    })
}

// way to export multiple things
module.exports = {
    sendWelcomeEmail,   //shorthand syntax
    sendCancelationEmail
}