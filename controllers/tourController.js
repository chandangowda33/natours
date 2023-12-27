/* eslint-disable prettier/prettier */
// const fs = require('fs');
const Tour = require('../models/tourModel');

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

exports.getAllTours = async (req, res) => {
  try {
    //gives all the documents in the db
    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};

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

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
      errmsg: err.errmsg,
    });
  }
};

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

exports.getTourByID = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    //we need to send id and body and new:true because we need updated body as return
    //runValidators:true runs validators again in the schema
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
