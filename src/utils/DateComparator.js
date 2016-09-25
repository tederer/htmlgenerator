/*
returns:

 -1 when the first date is before the second date
  0 when both dates are the same
  1 when the first date after the second date.
*/
var compare = function compare(firstDateString, secondDateString) {

   var firstDateMilliseconds = (new Date(firstDateString)).getTime();
   var secondDateMilliseconds = (new Date(secondDateString)).getTime();
   
   return Math.min(1, Math.max(-1, firstDateMilliseconds - secondDateMilliseconds));
};

exports.compare = compare;