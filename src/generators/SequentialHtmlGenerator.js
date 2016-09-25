var FileSystem = require('../utils/FileSystem.js');
var HtmlGenerator = require('./HtmlGenerator.js');
var logger = require('../utils/Logger.js').getLoggerFor('SequentialHtmlGenerator');

var fileSystem;
var htmlGenerator;
var SOURCE_WEB_ROOT_FOLDER;
var TARGET_WEB_ROOT_FOLDER;
var FILES_TO_SEND_WITHOUT_MODIFICATIONS;

var sendWithoutModifications = function sendWithoutModifications(relativePathToWebRoot) {

   var found = false;
   
   for (var index = 0; index < FILES_TO_SEND_WITHOUT_MODIFICATIONS.length && !found; index++) {
      
      var file = FILES_TO_SEND_WITHOUT_MODIFICATIONS[index];
      
      found = relativePathToWebRoot === file;
   }
   
   return found;
};


var recursiveGenerate = function recursiveGenerate(files) {
   
   var absoluteFilePath = files.pop();

   if (absoluteFilePath !== undefined) {
      
      var rawContent = fileSystem.getUtf8FileContent(absoluteFilePath);
      
      var requestedDocumentUrl = absoluteFilePath.substr(SOURCE_WEB_ROOT_FOLDER.length);
      var absoluteTargetPath   = TARGET_WEB_ROOT_FOLDER + requestedDocumentUrl;
      var absoluteTargetFolder = absoluteTargetPath.substr(0, absoluteTargetPath.lastIndexOf('/'));
      
      fileSystem.mkdirWithParents(absoluteTargetFolder);
      
      if (sendWithoutModifications(requestedDocumentUrl)) {
         
         logger.debug('writing file without modification: ' + absoluteFilePath);
         
         fileSystem.writeFile(absoluteTargetPath, rawContent);
         recursiveGenerate(files);
         
      } else {
         
         logger.debug('generating: ' + absoluteFilePath);
         
         htmlGenerator.generate(rawContent, requestedDocumentUrl, function(error, result) {

            if (error) {
               throw new Error(error);
            } else {
               fileSystem.writeFile(absoluteTargetPath, result);
            }
            
            recursiveGenerate(files);
         });
      }
   }
};


/*
 * Constructor(sourceWebRootFolder, targetWebRootFolder, includesRootFolder, [options])
 * 
 * options = {
 *    'alternativeFileSystem': FileSystem object
 *    'alternativeHtmlGenerator': HtmlGenerator object
 * }
 */
var Constructor = function Constructor(sourceWebRootFolder, targetWebRootFolder, includesRootFolder, filesToSendWithoutModifications, optionals) {

   fileSystem = (optionals === undefined || optionals.alternativeFileSystem === undefined) ? new FileSystem() : optionals.alternativeFileSystem;
   htmlGenerator = (optionals === undefined || optionals.alternativeHtmlGenerator === undefined) ? new HtmlGenerator(includesRootFolder) : optionals.alternativeHtmlGenerator;
   
   SOURCE_WEB_ROOT_FOLDER = sourceWebRootFolder;
   TARGET_WEB_ROOT_FOLDER = targetWebRootFolder;
   FILES_TO_SEND_WITHOUT_MODIFICATIONS = filesToSendWithoutModifications;
   
   this.generate = function generate(files) {
      recursiveGenerate(files.reverse());
   };
   
   
   this.getIncludes = function getIncludes() {
      return htmlGenerator.getIncludes();
   };
};


module.exports = Constructor;