/* global global, HtmlGenerator */

var INCLUDES_ROOT_FOLDER = 'any folder - does not count here';
var includesInserterCallbackError;
var includesInserterCallbackData;
var htmlFormatterResult;
var htmlFormatterInvocationCount;
var rawContent;
var requestedDocumentUrl;
var capturedValues;


var callback = function callback(error, data) {

   capturedValues.callbackError = error;
   capturedValues.callbackData = data;
};         


var optionals = {

   alternativeIncludesInserter: {
   
      insertIncludesInto: function insertIncludesInto(content, callback) {
         capturedValues.includesInserterContent = content;
         callback(includesInserterCallbackError, includesInserterCallbackData);
      }
   },

   alternativeHtmlFormatter: {
      insertParagraphs: function insertParagraphs(text) {
         htmlFormatterInvocationCount++;
         capturedValues.htmlFormatterText = text;
         return htmlFormatterResult;
      }
   },
   
   alternativeDocumentPathInserter: {
   
      insert: function insert(documentPath) {
         return {
            into: function into(content) {
               capturedValues.documentPathInserterContent = content;
               return content;
            }
         };
      }
   }
};


var generator = new HtmlGenerator(INCLUDES_ROOT_FOLDER, optionals);


var getLine = function getLine(lineNumber) {

   return {
      of: function of(text) {
            
            var line;
            
            if (text !== undefined) {
            
               var tempText = text;
               
               while ((tempText.length > 0) && (lineNumber > 0)) {
               
                  var nextLfIndex = tempText.indexOf('\n');
                  var lineLength = (nextLfIndex >= 0) ? nextLfIndex : tempText.length;
                  line = tempText.substr(0, lineLength).replace(/\r/, '');
                  tempText = tempText.substr(lineLength + 1);
                  lineNumber--;
               }
            }
            
            return line;
         }
   };
};

var getNumberOfLinesOf = function getNumberOfLinesOf(text) {
   
   var count = 0;
   
   var tempText = text;
   
   while (tempText.length > 0) {
   
      var nextLfIndex = tempText.indexOf('\n');
      var lineLength = (nextLfIndex >= 0) ? nextLfIndex : tempText.length;
      tempText = tempText.substr(lineLength + 1);
      count++;
   }

   return count;
};


var getShouldBeFor = function getShouldBe(capturedValueName, getLineNumber) {

   var genericShouldBe = function genericShouldBe(expectedValue) {

      generator.generate(rawContent, requestedDocumentUrl, callback);
      
      var capturedValue = capturedValues[capturedValueName];
      var numberOfLines = getNumberOfLinesOf(capturedValue);
      var lineNumber = getLineNumber(numberOfLines);
      
      expect(getLine(lineNumber).of(capturedValue)).to.be.equal(expectedValue);
   };
   
   return genericShouldBe;
};


var whenGeneratorGetsCalled = {

   thenTheCapturedValue: function thenTheCapturedValue(capturedValueName) {
   
      return {
         shouldBe: function shouldBe(expectedValue) {
         
                     generator.generate(rawContent, requestedDocumentUrl, callback);
                     expect(capturedValues[capturedValueName]).to.be.equal(expectedValue);
                  }
      };
   },
   
   thenTheHtmlFormatterInvocationCount: {
   
      shouldBe: function shouldBe(expectedValue) {
         expect(htmlFormatterInvocationCount).to.be.equal(expectedValue);
      }
   },
   
   thenLine: function thenLine(lineNumber) {
   
      var getLineNumber = function getLineNumber(totalNumberOfLines) {
         return lineNumber;
      };
      
      return {
         ofTheCapturedValue: function ofTheCapturedValue(capturedValueName) {
               return { shouldBe: getShouldBeFor(capturedValueName, getLineNumber) };
            }
      };
   },
   
   thenTheLastLine: function thenTheLastLine() {
   
      var getLineNumber = function getLineNumber(totalNumberOfLines) {
         return totalNumberOfLines;
      };
      
      return {
         ofTheCapturedValue: function ofTheCapturedValue(capturedValueName) {
               return { shouldBe: getShouldBeFor(capturedValueName, getLineNumber) };
            }
      };
   },
   
   thenTheLineBeforeTheLastLine: function thenTheLineBeforeTheLastLine() {
   
      var getLineNumber = function getLineNumber(totalNumberOfLines) {
         return totalNumberOfLines - 1;
      };
      
      return {
         ofTheCapturedValue: function ofTheCapturedValue(capturedValueName) {
               return { shouldBe: getShouldBeFor(capturedValueName, getLineNumber) };
            }
      };
   }
};


var setup = function setup() {
   
   capturedValues = {};
   includesInserterCallbackError = null;
   includesInserterCallbackData = undefined;
   htmlFormatterResult = undefined;
   htmlFormatterInvocationCount = 0;
   rawContent = 'my personal website\n\nMy name is et!\n';
   requestedDocumentUrl = '/test.htm';
};


describe('HtmlGenerator', function() {
	
   describe('generate', function() {

      beforeEach(setup);
      
      it('the input of the IncludesInserter contains the header template in the first line', function() {
         
         whenGeneratorGetsCalled.thenLine(1).ofTheCapturedValue('includesInserterContent').shouldBe('<!--@include /header.html-->');
      });
      
      it('given a request for page which is not in english, then the input of the IncludesInserter contains the german navigation template in the second line', function() {
         
         requestedDocumentUrl = '/index.htm';
         
         whenGeneratorGetsCalled.thenLine(2).ofTheCapturedValue('includesInserterContent').shouldBe('<!--@include /navigation_german.html-->');
      });
      
      it('given a request for an english page, then the input of the IncludesInserter contains the english navigation template in the second line', function() {
         
         requestedDocumentUrl = '/english/index.htm';
         
         whenGeneratorGetsCalled.thenLine(2).ofTheCapturedValue('includesInserterContent').shouldBe('<!--@include /navigation_english.html-->');
      });
      
      it('the input of the IncludesInserter contains the content-start template in the third line', function() {
         
         whenGeneratorGetsCalled.thenLine(3).ofTheCapturedValue('includesInserterContent').shouldBe('<!--@include /contentStart.html-->');
      });
      
      it('the input of the IncludesInserter contains the trailer template in the last line', function() {
         
         whenGeneratorGetsCalled.thenTheLastLine().ofTheCapturedValue('includesInserterContent').shouldBe('<!--@include /trailer.html-->');
      });
      
      it('given a request for page which is not in english, then the input of the IncludesInserter contains the german content-end template in the line before the last line', function() {
         
         requestedDocumentUrl = '/content.htm';
         
         whenGeneratorGetsCalled.thenTheLineBeforeTheLastLine().ofTheCapturedValue('includesInserterContent').shouldBe('<!--@include /contentEnd_german.html-->');
      });
      
      it('given a request for an english page, then the input of the IncludesInserter contains the english content-end template in the line before the last line', function() {
         
         requestedDocumentUrl = '/english/seeds/basic.htm';
         
         whenGeneratorGetsCalled.thenTheLineBeforeTheLastLine().ofTheCapturedValue('includesInserterContent').shouldBe('<!--@include /contentEnd_english.html-->');
      });
      
      it('the HtmlFormatter gets called with the output of the IncludeInserter', function() {
         
         includesInserterCallbackData = 'Reply of the IncludesInsert!';
         
         var expectedResult = includesInserterCallbackData;
         
         whenGeneratorGetsCalled.thenTheCapturedValue('htmlFormatterText').shouldBe(expectedResult);
      });
      
      it('the HtmlFormatter does not get called when the IncludeInserter failed', function() {
         
         includesInserterCallbackError = 'inserter failed';
         
         whenGeneratorGetsCalled.thenTheHtmlFormatterInvocationCount.shouldBe(0);
      });
       
      it('the callback receives the error provided by the IncludeInserter', function() {
         
         includesInserterCallbackError = 'inserter failed';
         
         var expectedResult = includesInserterCallbackError;
         
         whenGeneratorGetsCalled.thenTheCapturedValue('callbackError').shouldBe(expectedResult);
      });
            
      it('the DocumentPathInsert gets called with the output of the HtmlFormatter', function() {
         
         htmlFormatterResult = 'Donald was here';
         
         var expectedResult = htmlFormatterResult;
         
         whenGeneratorGetsCalled.thenTheCapturedValue('documentPathInserterContent').shouldBe(expectedResult);
      });
   });

   describe('getIncludes', function() {

      beforeEach(setup);
      
      it('returns all used includes', function() {
         
         var includes = generator.getIncludes();
         
         expect(includes).to.be.eql(['/header.html', '/navigation_german.html', '/navigation_english.html', '/contentStart.html', '/trailer.html', '/contentEnd_german.html', '/contentEnd_english.html']);
      });
  });
 });