/* eslint-disable prettier/prettier */
//here in this file goal is to make universal CRUD operation like if we send tour it should do CRUD on tours if we send reviews it should do crud on review
// eslint-disable-next-line import/extensions
const catchAsync = require('../utilities/catchAsync.js');
// eslint-disable-next-line import/extensions
const AppError = require('../utilities/appError.js');
const APIFeatures = require('../utilities/APIFeatures.js');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    //.explain gives detailed explanation on how did mongoose find the queries
    //in execucation stages object it gives how many documents it returned and how many documents its examined
    // .explain();

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newModel = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newModel,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    //in guide we only add users id's but to show to client we need to populate it but we dont sae that in DB in DB we only save id
    // const doc = await Model.findById(req.params.id).populate('reviews');
    //we
    // .populate({
    //   path: 'guides',
    //   //below two fields we dont want to populate about guides so we add - and mention field names here
    //   select: '-__v -passwordChangedAt',
    // });
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found witht that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: { doc },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //we need to send id and body and new:true because we need updated body as return
    //runValidators:true runs validators again in the schema
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found witht that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
