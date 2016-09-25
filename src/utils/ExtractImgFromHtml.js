var fs = require('fs');

var extractImgFromHtml = function extractImgFromHtml(path) {
    
   var result = [];
   var regex = /<img[^>]*src="([^"]*)"[^>]*>/g;

   var src = fs.readFileSync(path);
   
   while (regex.exec(src) !== null) {
     
      result[result.length] = RegExp.$1;
   }
   
   return result;
};

exports.extractImgFromHtml = extractImgFromHtml;