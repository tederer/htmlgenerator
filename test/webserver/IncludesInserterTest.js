/* global global, IncludesInserter */

var INCLUDES_ROOT_FOLDER = 'AnySourceFolder';

var inserter;
var includeFiles;
var capturedError;
var capturedData;

var optionals = {
   
   alternativeFileSystem: {
      
      getUtf8FileContent: function getUtf8FileContent(path) {
         return includeFiles[path];
      },
      
      exists: function exists(path) {
         return includeFiles[path] !== undefined;
      }
   }
};


var setup = function setup() {
   
   capturedError = null;
   capturedData = '';
   includeFiles = {};
   inserter = new IncludesInserter(INCLUDES_ROOT_FOLDER, optionals);
};


var whenReading = function whenReading(path) {
   return {
      thenReturn: function thenReturn(content) {
         includeFiles[INCLUDES_ROOT_FOLDER + path] = content;
      }
   };
};


var callback = function callback(err, data) {
   capturedError = err;
   capturedData = data;
};


describe('IncludesInserter', function() {
	
   describe('insertIncludesInto', function() {

      beforeEach(setup);
      
      it('should return the text unmodified when it does contain an include', function() {
         
         var content = 'bla';
         var expectedResult = 'bla';
         
         inserter.insertIncludesInto(content, callback);
         
         expect(capturedError).to.be.eql(null);
         expect(capturedData).to.be.eql(expectedResult);
      });
      
      it('should return the text with the include', function() {
         
         var includeFile = '/templates/myFirstInclude.htm';
         var includeContent = 'a included text';
         var content = 'This is a test with <!--@include ' + includeFile + '-->. It works fine!';
         var expectedResult = 'This is a test with ' + includeContent + '. It works fine!';
         
         whenReading(includeFile).thenReturn(includeContent);
         
         inserter.insertIncludesInto(content, callback);
         
         expect(capturedError).to.be.eql(null);
         expect(capturedData).to.be.eql(expectedResult);
      });
      
      it('should return the text with the includes when it contains more than one include', function() {
         
         var includeFile1 = '/templates/myFirstInclude.htm';
         var includeFile2 = '/templates/aSubFolder/list.txt';
         var includeContent1 = 'a included text';
         var includeContent2 = '1234567890_!!#';
         var content = 'This is a test with <!--@include ' + includeFile1 + '-->. It works fine!<!--@include ' + includeFile2 + '-->';
         var expectedResult = 'This is a test with ' + includeContent1 + '. It works fine!' + includeContent2;
         
         whenReading(includeFile1).thenReturn(includeContent1);
         whenReading(includeFile2).thenReturn(includeContent2);
         
         inserter.insertIncludesInto(content, callback);
         
         expect(capturedError).to.be.eql(null);
         expect(capturedData).to.be.eql(expectedResult);
      });
      
      it('should return an error when the include file does not exist', function() {
         
         var content = 'This is a test with <!--@include /templates/myTemp.csv-->. It works fine!';
         
         inserter.insertIncludesInto(content, callback);
         
         expect(capturedError).to.not.be.eql(null);
      });
   });
 });