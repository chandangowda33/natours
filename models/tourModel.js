/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
//below is the basic schema just data type defination with no validation
// const tourSchema=new.mongoose.Schema({
//   name:String,
//   rating:Number,
// price:Number
// })

//we can add error message if validation not met like how I added in required
//trim to remove white space before and after content
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have image Cover'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
});

//model is like a class so we need to add it with first letter capital

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
