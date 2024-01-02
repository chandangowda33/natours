/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    //here we using paresnt reference because we dont know how many reiews a tour wil get or
    //how many reviews a user will give there might be many
    //so we referencing each review with corresponding tour and review
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  //we are turning of tour population in reviews coz its just creates unnessary chaining populate when we search a tour
  //yet there will be reference here by id so no need to worry
  // {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   }
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //We have to add aggregate on model always so this in static method always points to model

  const stats = await this.aggregate([
    { $match: { tour: tourId } }, //filtering data which is needed for us
    {
      $group: {
        _id: '$tour', //we are grouping by tour so same tour will come under one group
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//we dont want one user to put multiple reviews on same tour
//we cant put unique on tour and user indivdually coz it makes one user can ass review on only pne tour
//so we will create a compound index [tour, user] and put index on that
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//we need to use post coz in pre this model not saved yet so if we do calculation it will not include the updated rating we sent
reviewSchema.post('save', function () {
  //this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndDelete
//findByIdAndUpdate
//for above both its only query middleware is available document middleware is not available
//coz its update anot save
//so they dont have access to document so they can't retrive the id from document like we did in above middleware
//below is the solution for that
//above two uses internally "findOneAnd" so we add that regular expression
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this points to current query
  //this contains query that might be containingfindone and delete so if we execute that we get document and we can save that
  //findOne returns the one document that satisfies that query
  //we are saving this in "this.r" coz we need to pass this Model to .post
  this.r = await this.findOne();
  //we cannot calculate ratings here coz in pre this model not saved yet so if we do calculation it will not include the updated rating we sent
  //but we need ID data so we used this here
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  //this.r is a review and in that tour will be there i.e id of tour
  //and Review Model is not yet created so its static method we need to run constructor on current model to save it this.r is current model
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
