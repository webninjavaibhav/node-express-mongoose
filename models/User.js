const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"]
  },
  email: {
    type: String,
    required: [
      true, "Please add an email"
    ],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"]
  },
  role: {
    type: String,
    enum: [
      "user", "publisher"
    ],
    default: "publisher"
  },
  password: {
    type: String,
    required: [
      true, "Plese add a password"
    ],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//encrypt password using Bcrypt
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({
    id: this._id
  }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE});
};

//match user enter password to hased password in database
userSchema.methods.matchPassword = async function (enterPassword) {
  return  await bcrypt.compare(enterPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
