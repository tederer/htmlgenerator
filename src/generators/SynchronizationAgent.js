var FileFinder = require('../utils/FileFinder.js');
var FileSystem = require('../utils/FileSystem.js');
var ReduceFunctions = require('../utils/ReduceFunctions.js');
var FilterFunctions = require('../utils/FilterFunctions.js');
var Include = require('./Include.js');


/*
 * Constructor(sourceWebRootFolder, includesRootFolder, [options])
 * 
 * options = {
 *    'alternativeFileSystem': FileSystem object
 *    'alternativeFileFinder': FileFinder object
 * }
 */
var Constructor = function Constructor(sourceWebRootFolder, includesRootFolder, includesOfEachHtmlFile, optionals) {

   var fileSystem = (optionals === undefined || optionals.alternativeFileSystem === undefined) ? new FileSystem() : optionals.alternativeFileSystem;
   
   if (optionals !== undefined && optionals.alternativeFileFinder !== undefined) {
      FileFinder = optionals.alternativeFileFinder;
   }
   
   var includesReducer = ReduceFunctions.getRemoveEntriesWithPrefixFunction(includesRootFolder);
   var includesFilter = FilterFunctions.getEntriesWithPrefixFilter(includesRootFolder);
      
   
   var getInclusionTextFor = function getInclusionTextFor(includes) {
         
         var text = '';
         
         includes.forEach(function(include) {
            text = text + Include.format(include);
         });
         
         return text;
   };
   
   
   this.getHtmlFilesWhichNeedToBeGenerated = function getHtmlFilesWhichNeedToBeGenerated(fileFinderResult) {
   
      var addedNonIncludeFiles   = fileFinderResult.addedFiles.reduce(includesReducer, []);
      var changedNonIncludeFiles = fileFinderResult.changedFiles.reduce(includesReducer, []);
      
      var addedIncludeFiles   = fileFinderResult.addedFiles.filter(includesFilter);
      var changedIncludeFiles = fileFinderResult.changedFiles.filter(includesFilter);
      
      var newOrChangedNonIncludeFiles = addedNonIncludeFiles.concat(changedNonIncludeFiles);
      var newOrChangedIncludeFiles    = addedIncludeFiles.concat(changedIncludeFiles);
      
      var returnValue = newOrChangedNonIncludeFiles.filter(FilterFunctions.htmlFileFilter);
      
      if (newOrChangedIncludeFiles.length > 0) {
      
         var htmlFiles = FileFinder.getHtmlFilesIn(sourceWebRootFolder).reduce(includesReducer, []);
         
         newOrChangedIncludeFiles.forEach( function(templateFilePath) {
      
            var relativeIncludePath = templateFilePath.substr(includesRootFolder.length);
            
            htmlFiles.forEach(function(htmlFilePath) {
               
               var fileContent = fileSystem.getUtf8FileContent(htmlFilePath) + getInclusionTextFor(includesOfEachHtmlFile);
               
               if (Include.text(fileContent).containsTheInclude(relativeIncludePath)) {
                  returnValue.push(htmlFilePath);
               }
            });
         });
      }
      
      return returnValue.sort().reduce(ReduceFunctions.unique, []);
   };
};

module.exports = Constructor;