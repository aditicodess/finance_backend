const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);

// Virtual populate
// userSchema.virtual("shares", {
//   ref: "share",
//   foreignField: "joined.user",
//   localField: "_id",
// });

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, "thisismynewtask", {
    expiresIn: "15d",
  });
  return token;
};

const User = mongoose.model("user", userSchema);

const signupValidate = (data) => {
  const schema = Joi.object({
    userName: Joi.string().required().label("User Name"),
    email: Joi.string().email().required().label("Email"),
    // share: Joi.string().required().label("Share"),
    password: passwordComplexity().required().label("Password"),
  });
  return schema.validate(data);
};

const loginValidate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = { User, signupValidate, loginValidate };
