const { Router } = require("express");
const authController = require("../controllers/authController");
const { check } = require("express-validator");

const router = Router();

router.post("/login", authController.login_post);
router.post("/signup", authController.signup_post);
router.post("/forgetpassword", authController.forgetPassword_post);
router.post(
  "/resetpassword",
  [
    check("password", "Enter atleast 6 character long password")
      .trim()
      .isLength({ min: 6 }),
    check("password2", "Email is not valid")
      .trim()
      .custom((value, { req }) => {
        if (value != req.body.password) {
          return Promise.reject("Password mismatch");
        }
        return true;
      }),
  ],
  authController.resetPassword_post
);

module.exports = router;
