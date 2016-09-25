var FileSystem = require('./FileSystem.js');
var fileFinderModule = require('./FileFinder.js');

var fileSystem;
var fileFinder;


/*
 * Constructor([options])
 * 
 * options = {
 *    'alternativeFileFinder': FileFinder object
 *    'alternativeFileSystem': FileSystem object
 * }
 * 
 * callback has one argument which contains the object created from the read JSON-file content.
 */
var Constructor = function Constructor(optionals) {
   
   fileFinder = (optionals === undefined || optionals.alternativeFileFinder === undefined) ? fileFinderModule : optionals.alternativeFileFinder;
   fileSystem = (optionals === undefined || optionals.alternativeFileSystem === undefined) ? new FileSystem() : optionals.alternativeFileSystem;


   this.getLastModifiedTimeOfFilesIn = function getLastModifiedTimeOfFilesIn(absolutPathOfRootFolder) {
      
      var result = {};
      var files = fileFinder.getAllFilesIn(absolutPathOfRootFolder);  
      
      files.forEach(function(path) {
            result[path] = fileSystem.getLastModifiedTimeOf(path);
      });
      return result;
   };
};

module.exports = Constructor;