/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line import/no-extraneous-dependencies
// npm i jsonwebtoken
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
//we only taking promisify so destrcuting it
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const sendEmail = require('../utilities/email');

const signToken = (id) =>
  //payload for jwt is id of new user in mdb id is _id
  //then we have to send secret and then expired in
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      //conveting to days
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    //cookies only sent when using https
    // secure: true,
    // making sure browser cant manipulate cookie
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //Remove passwords from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  //here we could have just sent the req.body thats makes everyone admin so we passed like this and we can change that manually incompass afterwards
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //check if user exists && password is correct
  //in User there wont be password so we use select method to get password
  const user = await User.findOne({ email }).select('+password');

  //no user or password is wrong send error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or Password is incorrect', 401));
  }
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //getting token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(`token: ${token}`);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  //verification token
  //we need to send token first in which paload is there and secret
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  //check if user changed password after the token was issues
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  //grant access to protected route
  req.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  //roles will be array with admin and lead guide as values
  //before this fn runs theres a fn which validates hes logged in or not and returns a res
  (req, res, next) => {
    console.log(roles.includes(req.user.role));
    if (!roles.includes(req.user.role)) {
      // eslint-disable-next-line no-new
      return next(
        new AppError("You don't have permission to perform this action", 401),
      );
    }
    next();
  };

//to reset password first user sends the email
//then we send email with random JWT and again client sends back the updated password with JWT we sent
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get users email from body
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Email does not exist.', 404));
  }

  //2.generate the random reset token
  const resetToken = user.correctPasswordResetToken();
  //we need to disable validator for this coz otherwise we get error
  await user.save({ validateBeforeSave: false });

  // 3.Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm to:${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  //if something bad happens we need to make password reset tokena nd expires i undefined and save it
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password resets in 10 mins',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email.Try again later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //find user with encrypted token and also expires also we need to check
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token expired send error
  if (!user) {
    return next(
      new AppError('Password reset token is invalid or has expired', 400),
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  //always use save so that middlewares will run and validators too
  await user.save();

  createSendToken(user, 200, res);
});

//when you logged in if you need to change password
exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log('here');
  //1 Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //check if posted current password is corect
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  console.log(user);

  // if password is correct so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // we are not using findbyidand update doesnt work here as it doesnt retain the object

  createSendToken(user, 200, res);
});
