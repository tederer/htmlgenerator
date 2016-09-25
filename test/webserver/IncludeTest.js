/* global global, Include */

var formatting = function formatting(path) {
   return {
      shouldReturn: function shouldReturn(expectedResult) {
      
         var result = Include.format(path);
         
         expect(result).to.be.eql(expectedResult);
      }
   };
};


var checkingIfTheText = function checkingIfTheText(text) {
   return {
      containsTheInclude: function containsTheInclude(path) {
         return {
            shouldReturn: function shouldReturn(expectedResult) {
            
               var result = Include.text(text).containsTheInclude(path);
               
               expect(result).to.be.eql(expectedResult);
            }
         };
      }
   };
};


describe('Include', function() {
	
   describe('PREFIX', function() {

      it('should be the prefix', function() {
         
         expect(Include.PREFIX).to.be.eql('<!--@include ');
      });
   });
	
   describe('SUFFIX', function() {

      it('should be the suffix', function() {
         
         expect(Include.SUFFIX).to.be.eql('-->');
      });
   });
	
   describe('format', function() {

      it('should return the formatted include - test 1', function() {
         
         formatting('/templates/form.html').shouldReturn('<!--@include /templates/form.html-->');
      });
     
      it('should return the formatted include - test 2', function() {
         
         formatting('donald.duck').shouldReturn('<!--@include donald.duck-->');
      });
   });
	
   describe('text(content).containsTheInclude(path)', function() {

      it('should return false when the text does not contain the include', function() {
         
         checkingIfTheText('this is a test').containsTheInclude('daisy.duck').shouldReturn(false);
      });

      it('should return true when the text contains the include somewhere inbetween of the text', function() {
         
         var include = 'daisy.duck';
         var text = 'This is my include test <!--@include ' + include + '-->. Does it work?';
         
         checkingIfTheText(text).containsTheInclude(include).shouldReturn(true);
      });

      it('should return true when the text starts with the include', function() {
         
         var include = 'don_juan';
         var text = '<!--@include ' + include + '-->. The sun is shining';
         
         checkingIfTheText(text).containsTheInclude(include).shouldReturn(true);
      });

      it('should return true when the text ends with the include', function() {
         
         var include = 'sunshine';
         var text = 'the music is nice<!--@include ' + include + '-->';
         
         checkingIfTheText(text).containsTheInclude(include).shouldReturn(true);
      });
   });
});