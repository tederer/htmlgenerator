var util = require('util');

var addLeadingZerosToInteger = function addLeadingZerosToInteger(number, requiredLength) {
   var result = '' + number;
   
   while (result.length < requiredLength) {
      result = '0' + result;
   }
   
   return result;
};

var Constructor = function Constructor() {

   this.getformattedDate = function getformattedDate() {
      
      var now = new Date();
      
      var formattedDate = now.getFullYear() + '-' + addLeadingZerosToInteger(now.getMonth() + 1, 2) + '-' + addLeadingZerosToInteger(now.getDate(), 2);
      var formattedTime = addLeadingZerosToInteger(now.getHours(), 2) + ':' + addLeadingZerosToInteger(now.getMinutes(), 2) + ':' + addLeadingZerosToInteger(now.getSeconds(), 2); 
      
      return formattedDate + ' ' + formattedTime;
   };
};

module.exports = Constructor;