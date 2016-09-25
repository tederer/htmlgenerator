var FileSystem = require('../utils/FileSystem.js');
var logger = require('../utils/Logger.js').getLoggerFor('IncludesInserter');

var fileSystem;
var INCLUDES_ROOT_FOLDER;


var initializeIncludesRootFolder = function includesRootFolder(path) {
   
   var indexOfLastSlash = path.lastIndexOf('/');
   
   INCLUDES_ROOT_FOLDER = (indexOfLastSlash === (path.length - 1)) ? path.substr(0, path.length - 2) : path;
};


/*
 * Constructor(includesRootFolder, [options])
 * 
 * options = {
 *    'alternativeFileSystem': FileSystem object
 * }
 */
var Constructor = function Constructor(includesRootFolder, optionals) {
   
   fileSystem = (optionals === undefined || optionals.alternativeFileSystem === undefined) ? new FileSystem() : optionals.alternativeFileSystem;
   
   initializeIncludesRootFolder(includesRootFolder);

   
   this.insertIncludesInto = function insertIncludesInto(content, callback) {
      
      var error = null;
      var newContent = content;
      var matchResult = content.match(/<!--\@include[^>]*>/g);
      
		if (matchResult !== null) {
		
			matchResult.forEach(function(match) {
            
				var matchWithSingleSpace = match.replace(/\s+/g, ' ');
				var filenameWithSuffix = matchWithSingleSpace.substr(matchWithSingleSpace.indexOf(' ') + 1);
            var relativePath = filenameWithSuffix.substring(0, filenameWithSuffix.indexOf('-->'));
				var filePath = INCLUDES_ROOT_FOLDER + relativePath;
				
				if (fileSystem.exists(filePath)) {
				
					var fileContent = fileSystem.getUtf8FileContent(filePath);
					newContent = newContent.replace(match, fileContent);
					
				} else {
               var message = 'can not insert "' + filePath + '" because it does not exist';
					error = 'ERROR: ' + message;
               logger.error('insertIncludesInto(...) failed with: ' + error);
				}
			});
		}
      
      callback(error, newContent);
   };
};

module.exports = Constructor;