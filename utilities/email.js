/* eslint-disable prettier/prettier */
// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //we cant use gmail coz it has some limit and not good
  //   {
  //   //it can be yahoo,hotmail anything you have
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  //   //we have to activate "less secure app" option in gmail
  // }
  //Mailtrap is email testing we can see how it looks after went to dev

  //define the email options
  const mailOptions = {
    from: 'Chandan <hello@chandan.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
