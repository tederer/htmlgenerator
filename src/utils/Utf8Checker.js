var fileFinder = require('./FileFinder.js');
var fs = require('fs');
var logger = require('./Logger.js').getLoggerFor('Utf8Checker');

var check = function check(webRootPath) {

   var nonUtf8Files = [];
   
   fileFinder.getHtmlFilesIn(webRootPath).forEach(function(path) { 
      
      var fileDescriptor = fs.openSync(path, 'r');
      var buffer = new Buffer(3);
      var offset = 0;
      var length = 3;
      var position = 0;
      
      fs.readSync(fileDescriptor, buffer, offset, length, position);
      
      if ( buffer[0] !== 0xEF || buffer[1] !== 0xBB || buffer[2] !== 0xBF) {
         nonUtf8Files[nonUtf8Files.length] = path;
      }
      
      fs.close(fileDescriptor);
   });
   
   if (nonUtf8Files.length > 0) {
   
      nonUtf8Files.forEach(function(path) {
         logger.info(path + ' is not "UTF8 with BOM" formatted!');
      });
   }
   
   return nonUtf8Files.length === 0;
};

exports.check = check;