/* global global, FilterFunctions */


var filtering = function filtering(input) {
   return {
      forHtml: function forHtml() {
         return {
            returns: function returns(expectedValue){
         
               var result = FilterFunctions.htmlFileFilter(input);
               expect(result).to.be.equal(expectedValue);
            }
         };
      },
      
      forPrefix: function forPrefix(prefix) {
         return {
            returns: function returns(expectedValue){
         
               var filter = FilterFunctions.getEntriesWithPrefixFilter(prefix);
               var result = filter(input);
               expect(result).to.be.equal(expectedValue);
            }
        };
     }
  };
};


describe('FilterFunctions', function() {
	
   describe('htmlFileFilter', function() {

      it('should return false when value does not ends with .htm - test1', function() {
         
         filtering('style.css').forHtml().returns(false);
      });
      
      it('should return false when value does not ends with .htm -test2', function() {
         
         filtering('counter.js').forHtml().returns(false);
      });
      
      it('should return false when value contains htm somewhere in the middle', function() {
         
         filtering('myHtm.txt').forHtml().returns(false);
      });
      
      it('should return true when value ends with .htm - caseInSensitive', function() {
         
         filtering('content.HTm').forHtml().returns(true);
      });
      
      it('should return true when value ends with .html', function() {
         
         filtering('test.html').forHtml().returns(true);
      });
      
      it('should return true when value ends with .html - caseInSensitive', function() {
         
         filtering('list.HTmL').forHtml().returns(true);
      });
   });
	
   describe('entriesWithPrefixFilter', function() {

      it('should return false when value does not start with the prefix', function() {
         
         filtering('random test text').forPrefix('anyPrefix').returns(false);
      });
      
      it('should return true when value starts with the prefix', function() {
         
         var prefix = '-123-';
         
         filtering(prefix + 'whatElse').forPrefix(prefix).returns(true);
      });
      
      it('should return false when the prefix is somewhere in the middle of the value', function() {
         
         var prefix = '##!';

         filtering('cat' + prefix + 'dog').forPrefix(prefix).returns(false);
      });
      
   });
 });