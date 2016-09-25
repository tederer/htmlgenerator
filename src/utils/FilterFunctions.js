/* removes duplicates in a sorted array */
var htmlFileFilter = function htmlFileFilter(value) {

   var isHtmFile = function isHtmFile(path) {
      return value.substr(value.length - '.HTM'.length).toUpperCase() === '.HTM';
   };
   
   var isHtmlFile = function isHtmlFile(path) {
      return value.substr(value.length - '.HTML'.length).toUpperCase() === '.HTML';
   };
   
   return isHtmFile(value) || isHtmlFile(value);
};


var getEntriesWithPrefixFilter = function getEntriesWithPrefixFilter(prefix) {
   
   return function entriesWithPrefixFilter(value) {
      return value.substr(0, prefix.length) === prefix; 
   };
};
   

exports.htmlFileFilter = htmlFileFilter;
exports.getEntriesWithPrefixFilter = getEntriesWithPrefixFilter;