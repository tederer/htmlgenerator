/* global global */

var FileSystem = require('./FileSystem.js');
var TimeSource = require('./TimeSource.js');

var CRLF = '\r\n';
var consoleOutputIsEnabled = true;

var assertLogfilenameIsNotUndefined = function assertLogfilenameIsNotUndefined() {
   if (global.LOGFILENAME === undefined) {
      throw new Error('global.LOGFILENAME is undefined!');
   }
};

exports.enableConsoleOutput = function enableConsoleOutput(value) {
   consoleOutputIsEnabled = value;
};
/*
 * Getter (classname, [options])
 * 
 * classname
 * options = {
 *    'alternativeFileSystem': FileSystem object
 *    'alternativeWriteToConsole': function(text)
 *    'alternativeTimeSource': TimeSource object
 * }
 * 
 * callback has one argument which contains the object created from the read JSON-file content.
 */
exports.getLoggerFor = function(classname, optionals) { 

   var timeSource = (optionals === undefined || optionals.alternativeTimeSource === undefined) ? new TimeSource() : optionals.alternativeTimeSource;
   var fileSystem = (optionals === undefined || optionals.alternativeFileSystem === undefined) ? new FileSystem() : optionals.alternativeFileSystem;
   var writeToConsole = (optionals === undefined || optionals.alternativeWriteToConsole === undefined) ? console.log : optionals.alternativeWriteToConsole;

   var loggerObject = {
   
      info: function info(text) {
         
         assertLogfilenameIsNotUndefined();
         
         var message = timeSource.getformattedDate() + ';INFO;' + classname + ';' + text;
         
         if (consoleOutputIsEnabled) {
            writeToConsole('\t' + text);
         }
         
         fileSystem.appendToFile(global.LOGFILENAME, message + CRLF);
      },
      
      debug: function debug(text) {
         
         assertLogfilenameIsNotUndefined();
         
         var message = timeSource.getformattedDate() + ';DEBUG;' + classname + ';' + text;
         
         fileSystem.appendToFile(global.LOGFILENAME, message + CRLF);
      },
      
      error: function error(text) {
         
         assertLogfilenameIsNotUndefined();
         
         var message = timeSource.getformattedDate() + ';ERROR;' + classname + ';' + text;
         
         fileSystem.appendToFile(global.LOGFILENAME, message + CRLF);
      }
   };
   
   return loggerObject;
};