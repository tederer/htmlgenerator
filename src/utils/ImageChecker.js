var fileFinder = require('./FileFinder.js');
var imageExtractor = require('./ExtractImgFromHtml.js');
var logger = require('./Logger.js').getLoggerFor('ImageChecker');

var check = function check(webRootPath) {

   var returnValue = true;
   var imagesInHtmlFiles = [];
   var images = fileFinder.getImageFilesIn(webRootPath);

   fileFinder.getHtmlFilesIn(webRootPath).forEach(function(path) { 

      var imagesOfHtmlFile = imageExtractor.extractImgFromHtml(path).map(function(relativePath) { return webRootPath + relativePath.replace(/%20/g, ' '); });
      imagesInHtmlFiles[imagesInHtmlFiles.length] = { filename: path, images: imagesOfHtmlFile };
   });

   var errors = [];

   imagesInHtmlFiles.forEach(function(htmlFile) {

      var notExistingImages = [];

      htmlFile.images.forEach(function(img) {
      
         if (images.indexOf(img) === -1) {
         
            notExistingImages[notExistingImages.length] = img;
         }
      });
      
      if (notExistingImages.length > 0) {
      
         errors[errors.length] = { filename: htmlFile.filename, images: notExistingImages };
      }
   });

   if (errors.length > 0) {

      returnValue = false;
      logger.info('The following HTML files reference not existing images !');
      
      errors.forEach(function(err) {
         err.images.forEach(
            function(img) {
               logger.info(err.filename + ': ' + img); 
            }
         );
      });
   }
   
   return returnValue;
};

exports.check = check;