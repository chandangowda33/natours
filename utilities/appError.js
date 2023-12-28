/* eslint-disable prettier/prettier */
class AppError extends Error {
  constructor(message, statusCode) {
    //we extended from the Error class and it only has message as property
    super(message);

    this.statusCode = statusCode;
    //if staus code starts with 4 set fail or error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    //there are 2 types of error
    //operational and programming
    //operational is that we can predict it might happen like data might not be there like that
    //programing is code error like wrong syntax or variable name
    //express middleware for operational error
    this.isOperational = true;

    //every error gets its own stacktrace error.stack
    //which is nothing but the point where error happened which we see in err
    //but if we want to hide that information then use below line
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
