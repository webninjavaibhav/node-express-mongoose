const ErrorResponse = require("./../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const User = require("../models/User");

// @desc Register User
// @route GET /api/v1/auth/Register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const {name, email, password, role} = req.body;

  //Create user
  const user = await User.create({name, email, password, role});

  //Create Token
  const token = user.getSignedJwtToken();

  res.status(200).json({success: true, token: token});
});

// @desc Login User
// @route POST /api/v1/auth/Register
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const {email, password} = req.body;

  //Validate Email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  //Check for user
  const user = await User.findOne({email}).select("+password");

  //check user exist
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //Check if password matches
  const isMatch = await user.matchPassword(password);

  //check is password matched
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //Create Token
  const token = user.getSignedJwtToken();

  res.status(200).json({success: true, token: token});
});
