var PREFIX = '<!--@include ';
var SUFFIX = '-->';


var format = function format(path) {
   return PREFIX + path + SUFFIX;
};


var text = function text(content) {
   return {
      containsTheInclude: function containsTheInclude(path) {
      
         var formattedInclude = format(path);
         
         return content.indexOf(formattedInclude) >= 0;
      }
   };
};


exports.format = format;
exports.text = text;
exports.PREFIX = PREFIX;
exports.SUFFIX = SUFFIX;