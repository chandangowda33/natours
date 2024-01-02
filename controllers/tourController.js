/* eslint-disable import/extensions */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
// const fs = require('fs');
const { MongoNetworkError } = require('mongodb');
const Tour = require('../models/tourModel');

const APIFeatures = require('../utilities/APIFeatures.js');
const AppError = require('../utilities/appError.js');

// eslint-disable-next-line import/extensions
const catchAsync = require('./../utilities/catchAsync.js');
const factory = require('./handlerFactory.js');

// // const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`id is ${val}`);
//   // if (req.param.id * 1 > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'Invalid ID',
//   //   });
//   // }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

// exports.getAllTours = (req, res) => {
//   // console.log(req.requestTIme);
//   // res.status(200).json({
//   //   status: 'success',
//   //   requestedAt: req.requestTIme,
//   //   results: tours.length,
//   //   _comment:
//   //     "below only 'tours' is mentioned because if key and value name is same we can specify one time and tours is from top level code where we reading the json file",
//   //   data: {
//   //     tours,
//   //   },
//   // });
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.createTour = factory.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// try {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// } catch (err) {
//   res.status(400).json({
//     status: 'failed',
//     message: err,
//     errmsg: err.errmsg,
//   });
// }
// });

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });

//filtering
// we gonna send sort limit page numbers also with filter
//but our document don't have those fields so it wont send any data
//so we need to remove those fiels and send for that below fields
// const queryObj = { ...req.query }; //creating copy of req.query
// const excludeFields = ['page', 'sort', 'limit', 'fields'];
// excludeFields.forEach((el) => delete queryObj[el]);

// console.log(req.query, queryObj);

//gives all the documents in the db
// const tours = await Tour.find();

//one way of filtering
// const tours = await Tour.find({
//   duration:5,
//   difficulty:'easy'
// });
//another way of filetrind
// const tours = await Tour.find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');

//Mongo db query
//{difficulty:'easy',duration:{$gte:5}}
//our req.query
//{difficulty:'easy',duration:{$gte:5}}
//so in our req.query $ is missing we need to add that
//so coverting to string
// let queryStr = JSON.stringify(queryObj);
//using regular expression \b indicates exact 4 mentioned in the brackets g means convert all occurance match is the matched word for that we added $
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
// console.log(JSON.parse(queryStr));

// let query = Tour.find(JSON.parse(queryStr));

//sorting
// if (req.query.sort) {
//   //we send more then one sorting options but we cant send with spce between them so we add , in url and here we remove it
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   //if there is no sort we sort it based on created date
//   query = query.sort('-createdAt');
// }

//Field limiting
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   console.log(fields);
//   query = query.select(fields);
// } else {
//   //if we add minus it will not show
//   query = query.select('-__v');
// }

//pagination
//converting to number and keeping default is one
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;

// //it will skip the number we mention and retrive the number of data we mentioned in limit
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error('This page does not exist');
// }

// const tours = await query;
// });

// exports.createTour = (req, res) => {
//   //middleware now added body to req
//   // console.log(req.body);
//   // we have to send back something to complete cycle

//   // we dont have db yet so taking last id and adding one
//   const newId = tours[tours.length - 1].id + 1;

//   //merge 2 object, we send the new tour with new ID
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     //When sending data to a web server, the data has to be a string so here converted to string
//     JSON.stringify(tours),
//     (err) => {
//       //201 for post method success means we written something
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     },
//   );
// };

// exports.getTourByID = (req, res) => {
//   //req.params assigns value from url to our variable
//   // console.log(req.params);

//   //value we got from url will be in string so convert to number below is simple method
//   const id = req.params.id * 1;
//   //.find loop over the array and creates new array of which passes the test
//   const tour = tours.find((el) => el.id === id);

//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'No ID',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// };

exports.getTourByID = factory.getOne(Tour, { path: 'reviews' });
// exports.getTourByID = catchAsync(async (req, res, next) => {
//   //in guide we only add users id's but to show to client we need to populate it but we dont sae that in DB in DB we only save id
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   //we
//   // .populate({
//   //   path: 'guides',
//   //   //below two fields we dont want to populate about guides so we add - and mention field names here
//   //   select: '-__v -passwordChangedAt',
//   // });

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   //we need to send id and body and new:true because we need updated body as return
//   //runValidators:true runs validators again in the schema
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour found witht that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found witht that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: { tour },
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  //aggregate is a pipeline which we can use to manipulate the data
  //in array we can define the stages that we want our data go through
  //then data goes through each stage one by one
  const stats = await Tour.aggregate([
    //filtering out tours with rating
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    //we can create a grp where can store many details
    {
      $group: {
        // _id: null,//null means it will group all the tours
        _id: '$difficulty',
        // _id: '$ratingsAverage',//it will group based on ratings
        //num of tours we sum with 1 each time tour pass by add 1
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        //avg of all the ratings average
        averageRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, //to make it ascending order
    },
    //we can use stages multiple times
    // {
    //   $match:{_id:{$ne:'Easy'}}//not equal to easy
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      //unwindes the array in input document and creates the document for each element
      //in this for each date a document creates so earlier had 9 tours and 3 dates in each tour
      //but now 9*3=27 is there
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //returns months as 1 for jan 2 for feb
        numTourStarts: { $sum: 1 }, //here for each month how many tours happened for each month
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, //here in this project stage we can define what stage we want send or not 0 means dont send
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12, //how much data we want to get from db
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  //we need to specify by dividing distance in km by earth radius
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
};

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        //
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
