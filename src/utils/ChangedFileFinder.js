var FileSystem = require('./FileSystem.js');
var FilePropertyHelper = require('./FilePropertyHelper.js');
var logger = require('./Logger.js').getLoggerFor('ChangedFileFinder');

var NOT_AVAILABLE = -1;
var fileSystem;
var filePropertyHelper;


var getJsonFileContent = function getJsonFileContent(path, callback) {

   var javasciptObject;
   var error = null;
   var fileContent = '{}';
   
   try {
      fileContent = fileSystem.getUtf8FileContent(path);
   } catch(e) {
      logger.debug('fileSystem.getUtf8FileContent("' + path + '") failed with: ' + e.message + ' -> using {} as input');
   }

   try {
      javasciptObject = JSON.parse(fileContent);
   } catch(e) {
      error = e;
      logger.error('JSON.parse(<filecontent of ' + path + '>) failed with: ' + e.message);
      logger.debug('file content of corrupted JSON file: \"' + fileContent + '"');
   }
      
   callback(error, javasciptObject);
};


var logDetailed = function logDetailed(prefix, files) {

   files.forEach(function(file) {
      logger.debug(prefix + file);
   });
};


/*
 * Constructor(lastModificationTimeSnapshotFile, [options])
 * 
 * lastModificationTimeSnapshotFile
 * options = {
 *    'alternativeFileSystem': FileSystem object
 *    'alternativeFilePropertyHelper': FilePropertyHelper object
 * }
 * 
 * callback has one argument which contains the object created from the read JSON-file content.
 */
var Constructor = function Constructor(lastModificationTimeSnapshotFile, optionals) {
   
   fileSystem = (optionals === undefined || optionals.alternativeFileSystem === undefined) ? new FileSystem() : optionals.alternativeFileSystem;
   filePropertyHelper = (optionals === undefined || optionals.alternativeFilePropertyHelper === undefined) ? new FilePropertyHelper() : optionals.alternativeFilePropertyHelper;

   /*
    * Returns the following object: 
    *
    * {
    *     changedFiles: [],   an array of file paths which were changed since this module was called for the last time
    *     addedFiles: [],     an array of file paths which were added since this module was called for the last time.
    *     deletedFiles: []    an array of file paths which were deleted since this module was called for the last time.
    * }
    */
   this.getChangedFilesIn = function getChangedFilesIn(rootFolder, callback) {
      
      var currentModificationTimeOf = filePropertyHelper.getLastModifiedTimeOfFilesIn(rootFolder);
      
      getJsonFileContent(lastModificationTimeSnapshotFile, function (error, storedModificationTimeOf) {
      
         var addedFiles = [];
         var changedFiles = [];
         var deletedFiles = [];
         
         if (error) {
            logger.error('getJsonFileContent failed with: ' + error);
            storedModificationTimeOf = {};
         }
         
         var currentlyExistingFiles = Object.keys(currentModificationTimeOf);
         var previouslyExistingFiles = Object.keys(storedModificationTimeOf);
         
         currentlyExistingFiles.forEach( function(file) {
            
            var lastModificationInMs = (new Date(currentModificationTimeOf[file])).getTime();
            var storedModificationInMs = (storedModificationTimeOf[file] === undefined) ? NOT_AVAILABLE : (new Date(storedModificationTimeOf[file])).getTime();
            
            if (storedModificationInMs === NOT_AVAILABLE) {
               
               addedFiles.push(file);
               
            } else {
               
               if (lastModificationInMs > storedModificationInMs) {
                  changedFiles.push(file);
               }
            }
         });
         
         previouslyExistingFiles.forEach( function(file) {
            
            if (currentlyExistingFiles.indexOf(file) === -1) {
               deletedFiles[deletedFiles.length] = file;
            }
         });
         
         if (!error) {
            logger.info(addedFiles.length + ' added files');
            logDetailed('added: ', addedFiles);
            
            logger.info(deletedFiles.length + ' deleted files');
            logDetailed('deleted: ', deletedFiles);
            
            logger.info(changedFiles.length + ' changed files');
            logDetailed('changed: ', changedFiles);
         }
         
         callback(error, {addedFiles: addedFiles, deletedFiles: deletedFiles, changedFiles: changedFiles});
      });
   };
};

module.exports = Constructor;