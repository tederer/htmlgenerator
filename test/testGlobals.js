/* global global, module:true */
'use strict';
var fs = require('fs');

global.sinon = require('sinon');
global.expect = require('expect.js');
global.expect = require('sinon-expect').enhance(global.expect, global.sinon, 'was');

var rootPath = global.PROJECT_ROOT_FOLDER;

var setSourceFilesAsRequired = function setSourceFilesAsRequired(sourceFilePath) {
   
   var SOURCE_FILE_EXTENSION = '.js';

   var files = fs.readdirSync(sourceFilePath);

   var sourceFiles = files.filter(function(element) { 

      var matches = false;
      var fileExtensionLength = SOURCE_FILE_EXTENSION.length;
      var suffix = element.substr(element.length - fileExtensionLength);

      if (element.length > fileExtensionLength) {
         matches = (suffix === SOURCE_FILE_EXTENSION) && (element !== 'testGlobals.js') && (element !== 'testStandard.js');
      }

      return matches;
   }).map(function(filename) { return sourceFilePath + '/' + filename; });

   sourceFiles.forEach(function(path) {
      
      var filename = path.substr(path.lastIndexOf('/') + 1);
      var moduleName = filename.substr(0, filename.length - SOURCE_FILE_EXTENSION.length);
      var newModule = require(path);
      global[moduleName] = newModule;
   });
}; 

if (typeof module === 'undefined') {
	module = {};
}

global.SOURCE_FILE_PATHS.forEach( function (sourceFilePath) {
   setSourceFilesAsRequired(sourceFilePath);
});