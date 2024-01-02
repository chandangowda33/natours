/* eslint-disable import/extensions */
/* eslint-disable prettier/prettier */
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const factory = require('./handlerFactory.js');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//using this as middleware and faking the loggged in id as param id
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('here');
  //if user sends any password or change password data error it out
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route isnot for password updates.Please use/updateMyPassword',
        400,
      ),
    );
  }

  //here we need to enter only the fields which allows user to update
  const filterBody = filterObj(req.body, 'name', 'email');
  //here we are not changing any sensitive data and we dont want any validators to run so we using .findbyidandupdate
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//this is by user they can only make inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = factory.updateOne(User);

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Use Sign up!!',
  });
};

//this is by admin he can delete
exports.deleteUser = factory.deleteOne(User);
