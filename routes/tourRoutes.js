/* eslint-disable prettier/prettier */
const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

//Param middleware is middle ware which runs only when some parameter present in the URL
//val is the value fourth parameter
// router.param('id', tourController.checkID);

//route aliasing to get top 5 cheap and top rated tours
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  //first checkbody runs and next createtour runs this way we can chain the middleware
  // .post(tourController.checkBody, tourController.createTour);
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourByID)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
