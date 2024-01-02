/* eslint-disable prettier/prettier */
// its conventional to have all the express config in app.js
const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
//this is to limit number of request from one ip
const rateLimit = require('express-rate-limit');

const helmet = require('helmet');
//path helps in changing the path names
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

//third party middleware from npm need to instal before using
const morgan = require('morgan');

// eslint-disable-next-line node/no-missing-require
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/reviewRoute');
//it will add bunch of methods to app
const app = express();

//pug is a view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//put it first
//Set security HTTP headers
app.use(helmet());

//limit 100 request in one hour from one
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

//only use it for routes starts in /api
app.use('/api', limiter);
//only when program running in development environment run this
//we have access to NODE_ENV coz its process variable depends on environment so we have
if (process.env.NODE_ENV === 'development') {
  //log every request to our server
  //just logs what kind of request we received and status of response and other details
  app.use(morgan('dev'));
}

//This is middleware
//middleware is function can manipulate incoming data
//in post request we add data to body to add that into request this middleware is used
//limiting body less than 10kb
app.use(express.json({ limit: '10kb' }));

//Data Santization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    //manually we have to add the fields which we use to sort and file
    whitelist: [
      'ratingsQuality',
      'duration',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
//above 4 should be in same order

//.use gives access to middleware
//middleware access to req, res and next function which passes the data to next fn in middleware stack
//all the request will go pass this
//if we add this after route this wont get executed coz code will end once .send comes or we need to next() to pass to middleware
app.use((req, res, next) => {
  console.log('Hello from the  middleware');
  //in middleware we have to specify next fn or our cose will get stuck here
  next();
});

app.use((req, res, next) => {
  req.requestTIme = new Date().toISOString();
  next();
});

//now if routes dont match it will search in public foldera dn from that we can see files in browser
//https://127.0.0.1:3000/overview.html
//we can get

// app.get('/', (req, res) => {
//   //.send to send string
//   // res.status(200).send('Hello from the server side!');
//   //.json to send json
//   res
//     .status(200)
//     //here we dont need specify headers wexpress will take care of that thing
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

//"__dirname" is current file path name
//convertin JSON to array
//this tours used in json we sending to client

//here 2nd parameter i.e callback function also called as route handlers
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
//to craete a variable from the url add :id
//to add optional variable add like :id?
// app.get('/api/v1/tours/:id', getTourByID);
//in put we need to send whole object but in patch whatpiece we need to update we can send
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//below is same as above but more organised

// app.route('/api/v1/tours').get(getAllTours).post(createTour);

// app
//   .route('/api/v1/tours/:id')
//   .get(getTourByID)
//   .patch(updateTour)
//   .delete(deleteTour);

// app.route('/api/v1/users').get(getAllUsers).post(createUser);

// app
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

//Above was having same route for 2 resources but we want to create seprete routes for different resources

//we assigned root route to variable

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter);

//if we get url other then our routes
//this has to be at the last

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  //created seperate class
  // //if we pass anything to next it will think as error and directly jump to error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//error handling middleware
app.use(globalErrorHandler);

module.exports = app;
