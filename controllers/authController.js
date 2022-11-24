const { User, signupValidate, loginValidate } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID =
  "1052950034287-oqgi27s2kbat62u0535b5hmv6644k8fa.apps.googleusercontent.com";
const CLEINT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04ejLL9HxT_ruCgYIARAAGAQSNwF-L9IrgSGHHNSDabFcReapZo52avHM-VPFmY553IfTGi4pV9sf-U2UfQPazdzKlUNlgs5HNss";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.signup_post = async (req, res) => {
  try {
    const { error } = signupValidate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(409)
        .send({ message: "User with given email already Exist!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await new User({ ...req.body, password: hashPassword }).save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports.login_post = async (req, res) => {
  try {
    const { error } = loginValidate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(401).send({ message: "Invalid Email or Password" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" });

    const token = user.generateAuthToken();
    res
      .status(200)
      .send({ token: token, data: user, message: "logged in successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// module.exports.user_detials = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email })
//       .sort({ createdAt: -1 })
//       .populate("share");

//     if (!user) return res.status(401).send({ message: "User does not exist" });

//     res
//       .status(200)
//       .send({ data: user, message: "fetched user data successfully" });
//   } catch (error) {
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// };

// router.get("/user/:id/shares",
module.exports.user_detials = async (req, res) => {
  try {
    let userShares = await User.findById(req.params.id)
      .sort({ createdAt: -1 })
      .populate({
        path: "shares",
      });

    res.status(200).send(userShares);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports.forgetPassword_post = async (req, res, next) => {
  const { email } = req.body;

  //Make sure user exist in Database
  User.findOne({ email: email }, function (error, userData) {
    if (userData == null) {
      return res.status(404).json({
        success: false,
        msg: "Email is not register",
      });
    }

    const secret = userData.password + "thisismynewtask";
    const payload = {
      email: userData.email,
      id: userData.id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const accessToken = oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "ritikachauhannn123@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "Noreply <ritikachauhannn123@gmail.com>",
      to: req.body.email,
      subject: "Reset Password",
      text: "Forget your password?",
      html: `<h1>Welcome To Finance-Pearly-gates!</h1><p>\
          <h3>Hello</h3>\
          If You have requested to reset your password then click on below link<br/>\
          <a href='https://finp.netlify.app/resetpassword/${userData.id}/${token}' >Click On This Link</a>\
          </p>`,
    };
    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        res.send("Email sent: " + info.response);
      }
    });
  });
};
//module.exports.resetPassword_get = (req, res, next) => {
//   const { id, token } = req.params;

//   //check if this id exist in database
//   User.findOne({ id: id }, function (error, userData) {
//     if (userData == null) {
//       return res.status(404).json({
//         success: false,
//         msg: "Invalid id.....",
//       });
//     }
//     //We have a valid id, and we have a valid user with this id
//     const secret = userData.password + "thisismynewtask";
//     try {
//       const payload = jwt.verify(token, secret);
//       res.render("resetPassword", { email: userData.email });
//     } catch (error) {
//       console.log(error + " this is the second error catch");
//       res.send(error.message);
//     }
//   });
// };
module.exports.resetPassword_post = async (req, res, next) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  const updates = { password: password };
  const options = { new: true };

  //check if this id exist in database
  User.findOne({ id: id }, async function (error, userData) {
    if (userData == null) {
      return res.status(404).json({
        success: false,
        msg: "Invalid id.....",
      });
    }

    const secret = userData.password + "thisismynewtask";
    try {
      const payload = jwt.verify(token, secret);
      //validate password and password2 should match
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      } else {
        const result = await User.findOneAndUpdate(
          { id: payload.id },
          updates,
          options
        );
        res.send(result);
      }
    } catch (error) {
      console.log(error.message + " this is error catch");
      res.send(error.message);
    }
  });
};
