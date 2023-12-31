/* eslint-disable prettier/prettier */
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    unique: true,
    //conerv
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: String,
  role: {
    type: String,
    //you cant set it to admin you have to manually do in the compass
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please tell us your password!'],
    // it wont show up in any output
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please tell us your password!'],
    validate: {
      //this only works on SAVE!!! and CREATE!!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangesAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //only run thsi fn if password is modifeid
  if (!this.isModified('password')) {
    return next();
  }

  //has the password
  //higher the number in second arguement more intense the CPU and more strongly encrypted
  this.password = await bcrypt.hash(this.password, 12);

  //after validation we dont want this to save in db so deleted
  this.passwordConfirm = undefined;
});

//this is instance method which is avaialble to every document of the model
//this comparission we could have done in controller only but here we have data so we do here
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangesAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangesAt.getTime() / 1000,
      //10 is base
      10,
    );
    //return if changes password after issued or not
    return JWTTimestamp < changedTimeStamp;
  }
  //false means not changes
  return false;
};

userSchema.methods.correctPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // we need to save encrypted password token in DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  //expires in 10mins
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //we send plain test in email not encrypted one
  return resetToken;
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;
