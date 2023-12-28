/* eslint-disable prettier/prettier */
//to catch async errors
// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
  return (req, res, next) => {
    //when promise got rejected it comes here
    fn(req, res, next).catch(next);
  };
};
