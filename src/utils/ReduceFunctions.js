/* removes duplicates in a sorted array */
var unique = function unique(previousValues, currentValue) {

   if ((previousValues.length === 0) || (previousValues[previousValues.length - 1] !== currentValue))  {
      previousValues.push(currentValue);
   }
   
   return previousValues;
};


var getRemoveEntriesWithPrefixFunction = function getRemoveEntriesWithPrefixFunction(prefix) {
   
   var currentValueStartsWithPrefix = function currentValueStartsWithPrefix(value) {
      return value.indexOf(prefix) === 0;
   };
   
   return function(previousValues, currentValue) {

      if (!currentValueStartsWithPrefix(currentValue))  {
         previousValues.push(currentValue);
      }
      
      return previousValues;
   };
};


var removeHtmlFiles = function removeHtmlFiles(previousValues, currentValue) {
   
   var isHtmFile = function isHtmFile(path) {
      return path.substr(path.length - '.HTM'.length).toUpperCase() === '.HTM';
   };
   
   var isHtmlFile = function isHtmFile(path) {
      return path.substr(path.length - '.HTML'.length).toUpperCase() === '.HTML';
   };
   
   if ((!isHtmFile(currentValue)) && (!isHtmlFile(currentValue))) {
      previousValues.push(currentValue);
   }
   
   return previousValues;
};


exports.unique = unique;
exports.getRemoveEntriesWithPrefixFunction = getRemoveEntriesWithPrefixFunction;
exports.removeHtmlFiles = removeHtmlFiles;