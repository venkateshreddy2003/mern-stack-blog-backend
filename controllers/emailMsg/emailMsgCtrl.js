const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const EmailMsg = require("../../model/EmailMessaging/EmailMessaging");
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
        user: process.env.MAIL,
        pass: process.env.GENERATED_APP_PASSWORD,
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
