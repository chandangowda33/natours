/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars
const slugify = require('slugify');

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars
const validator = require('validator'); //npm i validator
// const User = require('./userModel');
//below is the basic schema just data type defination with no validation
// const tourSchema=new.mongoose.Schema({
//   name:String,
//   rating:Number,
// price:Number
// })

//we can add error message if validation not met like how I added in required
//trim to remove white space before and after content
//if we add select:false to one of the field mongoose dont send that data when we retrive it
//virtual properties is the fields which we dont want to save in db

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //validator
      unique: true, //not validator
      //select:false
      trim: true,
      maxlength: [40, 'A tour name must have less or equal to 40 characters'], //validator
      minlength: [5, 'A tour name must have more or equal to 10 characters'], //validator
      // // validate: [
      //   validator.isAlpha,
      //   'tour name should only contains alphabetic',
      // ], //checks if only alphabetic
    },
    slugify: String,
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
      min: [1, 'Ratings must be above 1.0'], //validator
      max: [5, 'Ratings must be above 5.0'], //validator
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      //if we have one or more values we have to use like this
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      }, //validator
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      //custom validator
      validate: {
        validator(value) {
          return value < this.price;
        },
        message: 'Discount price should be below regular price',
      },
    },
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
    //GeoJSON
    //to have Geospatial data in MongoDB we should create object of 2 fields one with string and another with coordinates
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      //this will be of array with longitude and latitude
      coordinates: [Number],
      address: String,
      description: String,
    },
    //below is embedded document it should be of array so wrapped in[]
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        //this will be of array with longitude and latitude
        coordibates: [Number],
        address: String,
        description: String,
      },
    ],
    //if you want embedded
    // guides: Array,
    //if you want to reference
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        //here we dont need to import Uder model also for this
        ref: 'User',
      },
    ],
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  //second arguement we can add optional parameter which defines when we need to send virtual parameter
  {
    //when we ending the data as JSON send it
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  //calculation how long tour is in weeks
  //using regular fn coz => fn dont get its own this keyword
  return this.duration / 7;
});

//if we want to query tours which are above 1000 then query have to go through all documents
//by index it will create a seperate table based on price and index them so when we send query it will go through first documertns till price falls below 3
//1 is for ascending -1 or descending
//in compass you can see but sometimes it wont show there try several times
// tourSchema.index({ price: 1 });

//this is compound indexing
//there is no right way for this based on our requirement we have to do this
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
//this is special indexing which helps in geospatical data
tourSchema.index({ startLocation: '2dsphere' });

// below is virtual populate of reviews
//right now non of the tour have an idea which all reviews about them
//we can't store id's of review in tour DB coz we know it might get big
//so we use this virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  //in below field we should mention the object name in Schema in which you used ref:'Tour'
  foreignField: 'tour',
  localField: '_id',
});

//Document middleware
//.pre middleware happens which is pre middleware happens before .save() and .create() which saves data in db
tourSchema.pre('save', function (next) {
  //this will add lowecase name property to slugify
  this.slugify = slugify(this.name, { lower: true });
  // console.log(this); //this points to document so its called document middleware;
  next();
});

//we can have multiple pre save hooks and post save hooks

// .post middleware happens after saving the data db and ,post gets access to doc and next
//middlewares also called as hooks below is post save hook
// tourSchema.post('save', (doc, next) => {
//   // console.log(doc);
//   next();
// });

//If you want to embed the guide details in tour model use below code
//but tit has drawback think if guide wants to updae his data then again we have to update here too
//so we use referencing here
// tourSchema.pre('save', async function (next) {
//   //inside map there is async so it return promises and it will be ful of promises
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   //so here we run promise.all to execute at once
//   this.guides = await Promise.all(guidesPromises);
// });

//Query middleware
//it points to query,below example is checking whether its secret tour to some VIP's
//here all the queries start with find i.e, find, findbyid...
tourSchema.pre(/^find/, function (next) {
  // console.log(this);//this is query now
  //removes secret tours which are true
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  console.log('populate');
  this.populate({
    path: 'guides',
    //below two fields we dont want to populate about guides so we add - and mention field names here
    select: '-__v -passwordChangedAt',
  });

  next();
});

//here we gets access to docs sent by that query
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!!`);

  next();
});

//aggregation middleware
//this will get added to aggrgators
//without this if we want to exclude secret tours we can do here
// tourSchema.pre('aggregate', function (next) {
//   //unshift adds this to top of array
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline()); //this points to cuurent aggregator and pipeline is the stages we wrote
//   next();
// });

//model is like a class so we need to add it with first letter capital
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
