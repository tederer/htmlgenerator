var IncludesInserter = require('./IncludesInserter.js');
var HtmlFormatter = require('./HtmlFormatter.js');
var DocumentPathInserter = require('./DocumentPathInserter.js');
var Include = require('./Include.js');

var CRLF = '\r\n';
var includes = {};

includes.header              = '/header.html';           
includes.navigationGerman    = '/navigation_german.html';
includes.navigationEnglish   = '/navigation_english.html';
includes.contentStart        = '/contentStart.html';
includes.trailer             = '/trailer.html';     
includes.contentEndGerman    = '/contentEnd_german.html';
includes.contentEndEnglish   = '/contentEnd_english.html';

var HEADER              = Include.PREFIX + includes.header             + Include.SUFFIX;
var GERMAN_NAVIGATION   = Include.PREFIX + includes.navigationGerman   + Include.SUFFIX;
var ENGLISH_NAVIGATION  = Include.PREFIX + includes.navigationEnglish  + Include.SUFFIX;
var CONTENT_START       = Include.PREFIX + includes.contentStart       + Include.SUFFIX;
var TRAILER             = Include.PREFIX + includes.trailer            + Include.SUFFIX;
var GERMAN_CONTENT_END  = Include.PREFIX + includes.contentEndGerman   + Include.SUFFIX;
var ENGLISH_CONTENT_END = Include.PREFIX + includes.contentEndEnglish  + Include.SUFFIX;

var includesInserter;
var htmlFormatter;
var documentPathInserter;


var urlStartsWithEnglish = function urlStartsWithEnglish(url) {
   return url.indexOf('/english/') >= 0;
};


/*
 * Constructor(includesRootFolder, [options])
 * 
 * options = {
 *    'alternativeDocumentPathInserter': DocumentPathInserter object
 *    'alternativeIncludesInserter': IncludesInserter object
 *    'alternativeHtmlFormatter': HtmlFormatter object
 * }
 */
var Constructor = function Constructor(includesRootFolder, optionals) {

   includesInserter = (optionals === undefined || optionals.alternativeIncludesInserter === undefined) ? new IncludesInserter(includesRootFolder) : optionals.alternativeIncludesInserter;
   htmlFormatter = (optionals === undefined || optionals.alternativeHtmlFormatter === undefined) ? new HtmlFormatter() : optionals.alternativeHtmlFormatter;
   documentPathInserter = (optionals === undefined || optionals.alternativeDocumentPathInserter === undefined) ? new DocumentPathInserter() : optionals.alternativeDocumentPathInserter;

  
   this.generate = function generate(rawContent, requestedDocumentUrl, callback) {

      var error = null;
      var result;
      var inEnglish = urlStartsWithEnglish(requestedDocumentUrl);
      
      var navigation = inEnglish ? ENGLISH_NAVIGATION  : GERMAN_NAVIGATION;
      var contentEnd = inEnglish ? ENGLISH_CONTENT_END : GERMAN_CONTENT_END;
      
      var content = HEADER + CRLF + navigation + CRLF + CONTENT_START + CRLF + rawContent + CRLF + contentEnd + CRLF + TRAILER + CRLF;
      
      includesInserter.insertIncludesInto(content, function(inserterError, contentWithIncludes) {
         
         if (inserterError) {
            
            error = inserterError;
            
         } else {
            
            result = htmlFormatter.insertParagraphs(contentWithIncludes);
            result = documentPathInserter.insert(requestedDocumentUrl).into(result);
         }
         
         callback(error, result);
      });
   };
   
   
   this.getIncludes = function getIncludes() {
      
      var result = [];
      
      for (var propertyName in includes) {
         result.push(includes[propertyName]);
      }
      
      return result;
   };
};


module.exports = Constructor;