var FileSystem = require('./FileSystem.js');
var logger = require('./Logger.js').getLoggerFor('EmptyFolderRemover');

var fileSystem;

var recursiveClean = function recursiveClean(absolutePathOfRootFolder, currentFolder) {
   
   var result = { removedFolders: [], folderWasRemoved: false };
   
   var numberOfFilesInCurrentFolder = 0;
   var numberOfSubfoldersInCurrentFolder = 0;
   
   var directoryContent = fileSystem.readDir(currentFolder);
   
   directoryContent.forEach(function(content){
      
      var absolutePathOfContent = currentFolder + '/' + content;
      
      if (fileSystem.isDirectory(absolutePathOfContent)) {
      
         var recursiveResult = recursiveClean(absolutePathOfRootFolder, absolutePathOfContent);
         result.removedFolders = result.removedFolders.concat(recursiveResult.removedFolders);
         
         numberOfSubfoldersInCurrentFolder += recursiveResult.folderWasRemoved ? 0 : 1;
         
      } else {
         numberOfFilesInCurrentFolder++;
      }
   });
   
   if (currentFolder !== absolutePathOfRootFolder) {
      
      if ((numberOfFilesInCurrentFolder + numberOfSubfoldersInCurrentFolder) === 0) {
         fileSystem.remove(currentFolder);
         result.removedFolders.push(currentFolder);
         result.folderWasRemoved = true;
      }
   }
   
   return result;
};

/*
 * Constructor([options])
 * 
 * options = {
 *    'alternativeFileSystem': FileSystem object
 * }
 */
var Constructor = function Constructor(optionals) {

   fileSystem = (optionals === undefined || optionals.alternativeFileSystem === undefined) ? new FileSystem() : optionals.alternativeFileSystem;
   
   this.clean = function clean(absolutePathOfRootFolder) {
      
      var result = { removedFolders: []};
   
      try {
         result = recursiveClean(absolutePathOfRootFolder, absolutePathOfRootFolder);
      } catch(e) {
         logger.error('recursiveClean(' +  absolutePathOfRootFolder + ', ' + absolutePathOfRootFolder + ') failed with: ' + e.message);
      }
   
      result.removedFolders.forEach(function(path) {
         logger.info('removed folder ' + path);
      });
      
      return result.removedFolders;
   };
}; 

module.exports = Constructor;