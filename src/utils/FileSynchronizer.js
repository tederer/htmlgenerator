var FileSystem = require('./FileSystem.js');
var ReduceFunctions = require('./ReduceFunctions.js');

var logger;
var fileSystem;
var SOURCE_WEB_ROOT_FOLDER;
var TARGET_WEB_ROOT_FOLDER;
var copyFile;  
var writeToConsole; 
var stdout;

var assertPathIsDirectory = function assertPathIsDirectory(path, descriptionPrefix) {
   
   var fileExists = false;
   var isDirectory = false;

   try {
      var stats = fileSystem.getStatsOf(path);
      
      fileExists = true;
      isDirectory = stats.isDirectory();
      
   } catch(e) {}
   
   if (!fileExists) {
      throw new Error(descriptionPrefix + ' "' + path + '" does not exist!');
   }
   
   if (!isDirectory) {
      throw new Error(descriptionPrefix + ' "' + path + '" is not a directory!');
   }
};


var assertSourceAndTargetFoldersDiffer = function assertSourceAndTargetFoldersDiffer(sourcePath, targetPath) {
   if (sourcePath === targetPath) {
      throw new Error('source and target path are the same!');
   }
};
   
   
var getTargetPathOf = function getTargetPathOf(sourcePath) {

   var relativePath = sourcePath.substr(SOURCE_WEB_ROOT_FOLDER.length);
   return TARGET_WEB_ROOT_FOLDER + relativePath;
};


var removeFoldersWhichAreParentsOfOthers = function removeFoldersWhichAreParentsOfOthers(processedPaths, currentPath) {

   if (processedPaths.length === 0) {
   
      processedPaths.push(currentPath);
      
   } else {
   
      var lastProcessedPath = processedPaths[processedPaths.length - 1];
      
      if (currentPath.indexOf(lastProcessedPath) === 0) {
      
         processedPaths[processedPaths.length - 1] = currentPath;
         
      } else {
      
         processedPaths.push(currentPath);
      }
   }
   
   return processedPaths;
};
   
   
var createTargetFoldersFor = function createTargetFoldersFor(files) {

   var toTheirTargetFolder = function toTheirTargetFolder (path) { 
   
      var targetPath = getTargetPathOf(path);
      var indexOfLastSlash = targetPath.lastIndexOf('/'); 
      
      return targetPath.substr(0, indexOfLastSlash);
   };
   
   var targetFolders = files.map(toTheirTargetFolder).sort().reduce(ReduceFunctions.unique, []).reduce(removeFoldersWhichAreParentsOfOthers, []);
   
   if (targetFolders.length > 0) {
      logger.info('creating ' + targetFolders.length + ' target folder(s) ...');
   }
   
   targetFolders.forEach(function(path) { 
      logger.debug('creating folder ' + path);
      fileSystem.mkdirWithParents(path); 
   });
};


var recursiveCopyFiles = function recursiveCopyFiles(files, index, callback) {

   if (index >= files.length) {
   
      callback();
      
   } else {

      var sourcePath = files[index];
      var targetPath = getTargetPathOf(sourcePath);
      
      logger.debug('copying ' + sourcePath + ' -> ' + targetPath);
      
      fileSystem.copyFile(sourcePath, targetPath, function() {
         recursiveCopyFiles(files, index + 1, callback);
      });
   }
};
   
/*
 * Constructor(sourceWebRootFolder, targetWebRootFolder, [options])
 * 
 * options = {
 *    'alternativeFileSystem': FileSystem object
 *    'alternativeLogger': Logger object
 * }
 */
var Constructor = function Constructor(sourceWebRootFolder, targetWebRootFolder, optionals) {
   
   fileSystem = (optionals === undefined || optionals.alternativeFileSystem === undefined) ? new FileSystem() : optionals.alternativeFileSystem;
   logger = (optionals === undefined || optionals.alternativeLogger === undefined) ? require('./Logger.js').getLoggerFor('FileSynchronizer') : optionals.alternativeLogger;
   
   assertPathIsDirectory(sourceWebRootFolder, 'sourceWebRootFolder') ;
   assertPathIsDirectory(targetWebRootFolder, 'targetWebRootFolder') ;
   assertSourceAndTargetFoldersDiffer(sourceWebRootFolder, targetWebRootFolder);
   
   SOURCE_WEB_ROOT_FOLDER = sourceWebRootFolder;
   TARGET_WEB_ROOT_FOLDER = targetWebRootFolder;
   
   
   this.copyFiles = function copyFiles(files, callback) {
      
      createTargetFoldersFor(files);

      if (files.length > 0) {
         logger.info('copying ' + files.length + ' file(s) ...');
      }
      
      recursiveCopyFiles(files, 0, callback);
   };
   
   
   this.remove = function remove(files) {

      if (files.length > 0) {
         logger.info('removing ' + files.length + ' file(s) ...');
      }
      
      files.forEach(function(sourcePath) {   
      
         var targetPath = getTargetPathOf(sourcePath);
         logger.debug('removing ' + targetPath);
         fileSystem.remove(targetPath);
      });
   };
};

module.exports = Constructor;