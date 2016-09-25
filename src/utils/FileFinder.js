var fs = require('fs');

var SUPPORTED_IMAGE_EXTENSIONS = ['JPG','JPEG','GIF','PNG'];
var SUPPORTED_HTML_EXTENSIONS = ['HTM','HTML'];

var getFiles = function getFiles(currentFolder, filter) {
    
    var result = [];
    
    fs.readdirSync(currentFolder).forEach(function(file) {

        var path = currentFolder + '/' + file;
        var stats = fs.statSync(path);
        
        if (stats.isDirectory()) {
            getFiles(path, filter).forEach(function(f) {result.push(f);});
        } else {
            if (filter(file)) {
                result[result.length] = currentFolder + '/' + file;
            }
        }
    });
    
    return result;
};

var fileExtensionFilter = function fileExtensionFilter(filename, allowedExtensions) { 
    
    var matches = false;
    var lastPointPosition = filename.lastIndexOf('.'); 
    
    if (lastPointPosition >= 0) {
    
        var fileExtension = filename.substr(lastPointPosition + 1).toUpperCase();
        
        if (allowedExtensions.indexOf(fileExtension) >= 0) {
            matches = true;
        }
    }
    
    return matches; 
};

var allFileExtensionsFilter = function allFileExtensionsFilter() {
   return true;
};

var imageFilter = function imageFilter(filename) {
   return fileExtensionFilter(filename, SUPPORTED_IMAGE_EXTENSIONS);
};

var htmlFilter = function htmlFilter(filename) {
   return fileExtensionFilter(filename, SUPPORTED_HTML_EXTENSIONS);
};

/*
 * This methods return an array containing the files with the requested extension. 
 * The search goes recursive through all subfolders of path.
*/
exports.getHtmlFilesIn = function(path) { return getFiles(path, htmlFilter);};
exports.getImageFilesIn = function(path) { return getFiles(path, imageFilter);};
exports.getAllFilesIn = function(path) { return getFiles(path, allFileExtensionsFilter);};