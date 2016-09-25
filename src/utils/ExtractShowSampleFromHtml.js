var fs = require('fs');

var extractShowSampleFromHtml = function extractShowSampleFromHtml(path) {
    
   var result = [];
   var regex = /<a[^>]*href="javascript:showSample\('([^>]*)'\)[^>]*>/g;

   var src = fs.readFileSync(path);
   
   while (regex.exec(src) !== null) {
     
      result[result.length] = RegExp.$1;
   }
   
   return result;
};

exports.extractShowSampleFromHtml = extractShowSampleFromHtml;