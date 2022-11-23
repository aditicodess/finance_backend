const { User, signupValidate, loginValidate } = require("../models/User");
const bcrypt = require("bcrypt");

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
