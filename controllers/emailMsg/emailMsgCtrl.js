const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const EmailMsg = require("../../model/Emailmessaging/EmailMessaging");
const Filter = require("bad-words");
const sendEmailMsgCtrl = expressAsyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;
  const emailmessage = subject + " " + message;
  const filter = new Filter();
  const isProfane = filter.isProfane(emailmessage);
  if (isProfane) {
    throw new Error("email sent failed because it contains profane words");
  }
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.MAIL,
        pass: process.env.pass,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: process.env.MAIL,
      to,
      subject,
      text: message,
    };
    const result = await transport.sendMail(mailOptions);
    // save to our database
    await EmailMsg.create({
      sentBy: req?.user?._id,
      fromEmail: req?.user?.email,
      toEmail: to,
      subject,
      message,
    });
    res.json(result);
  } catch (error) {
    res.json(error);
  }
});
module.exports = { sendEmailMsgCtrl };
