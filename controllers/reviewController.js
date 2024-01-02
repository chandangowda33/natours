/* eslint-disable import/extensions */
/* eslint-disable prettier/prettier */
const Review = require('../models/reviewModel');
// const catchAsync = require('../utilities/catchAsync');
const factory = require('./handlerFactory.js');

exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
  //this way we can send tourid data either i body or in params
  if (!req.body.tour) req.body.tour = req.params.tourId;
  //in .protect req.user.id will be there
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = factory.createOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });

exports.getReviews = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
