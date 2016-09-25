var fileFinder = require('./FileFinder.js');
var imageExtractor = require('./ExtractImgFromHtml.js');
var showSampleExtractor = require('./ExtractShowSampleFromHtml.js');
var logger = require('./Logger.js').getLoggerFor('NonReferencedImagesFinder');


var getFolderFilterFunction = function getFolderFilterFunction(pathsToIgnore) {
   
   var filterFunction = function filterFunction(path) {
      
      var found = false;
      
      for(var index = 0; (index < pathsToIgnore.length) && !found; index++) {
         found = path.indexOf(pathsToIgnore[index]) === 0;
      }
      
      return !found;
   };
   
   return filterFunction;
};


var check = function check(webRootPath, pathsToIgnore) {

   var makePathAbsoluteAndReplaceEscapedSpaces = function makePathAbsoluteAndReplaceEscapedSpaces(relativePath) {
      return webRootPath + relativePath.replace(/%20/g, ' '); 
   };

   var returnValue = true;
   var imagesInHtmlFiles = [];
   
   if (pathsToIgnore === undefined) {
      pathsToIgnore = [];
   }
   
   var images = fileFinder.getImageFilesIn(webRootPath).filter(getFolderFilterFunction(pathsToIgnore));
   
   fileFinder.getHtmlFilesIn(webRootPath).forEach(function(path) { 

      var imagesOfHtmlFile = imageExtractor.extractImgFromHtml(path).map(makePathAbsoluteAndReplaceEscapedSpaces);
      
      var samples = showSampleExtractor.extractShowSampleFromHtml(path);
      
      samples.map(makePathAbsoluteAndReplaceEscapedSpaces).forEach(function(sampleImg) {
         imagesOfHtmlFile[imagesOfHtmlFile.length] = sampleImg;
      });
   
      imagesInHtmlFiles[imagesInHtmlFiles.length] = { filename: path, images: imagesOfHtmlFile };
   });

   imagesInHtmlFiles.forEach(function(htmlFile) {

      var imagesToDelete = [];
      
      htmlFile.images.forEach(function (img) {
      
         if (images.indexOf(img) >= 0) {
         
            imagesToDelete[imagesToDelete.length] = img;
         }
      });
      
      imagesToDelete.forEach(function (path) { images.splice(images.indexOf(path), 1); });
   });

   if (images.length > 0) {

      returnValue = false;
      
      images.forEach(function(path) {
         logger.info(path + ' is not referenced in any HTML document!');
      });
   }
   
   return returnValue;
};

exports.check = check;