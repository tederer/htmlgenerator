/* global global, FilePropertyHelper */

var capturedPath;
var requestedPropertyOfFiles;
var filesIn;
var lastModificationTimeOf;


var fileSystem = {
   
   getUtf8FileContent: function getUtf8FileContent(absolutePathOfFile) {
      return undefined;
   },
   
   getLastModifiedTimeOf: function getLastModifiedTimeOf(path) {
      requestedPropertyOfFiles.push(path);
      return lastModificationTimeOf[path];
   }
};


var fileFinder = {
   
   getAllFilesIn: function getAllFilesIn(absolutePathOfRootFolder) {
      
      capturedPath = absolutePathOfRootFolder;
      
      var result= [];
      
      var folderContent = filesIn[absolutePathOfRootFolder];
      
      if (folderContent !== undefined) {
      
         folderContent.forEach(function(file) {
            result.push(absolutePathOfRootFolder + '/' + file);
         });
      }
      
      return result;
   }
};


var optionals = {
   alternativeFileSystem: fileSystem,
   alternativeFileFinder: fileFinder
};


var setup = function setup() {
   capturedPath = undefined;
   requestedPropertyOfFiles = [];
   filesIn = {};
   lastModificationTimeOf = {};
};

         
var givenTheFolder = function givenTheFolder(folder) {

   return {

      contains: function contains(file) {
      
         var folderContent = filesIn[folder];
         
         if (folderContent === undefined) {
            folderContent = [];
         }
         
         folderContent.push(file);
         filesIn[folder] = folderContent;
      }
   };
};


var givenTheFile = function givenTheFile(file) {

   return {

      wasLastModifiedOn: function wasLastModifiedOn(lastModificationTime) {
      
         lastModificationTimeOf[file] = lastModificationTime;
      }
   };
};


describe('FilePropertyHelper', function() {

   describe('getLastModifiedTimeOfFilesIn', function() {
   
      beforeEach(setup);
   
      it('requests the list of files in the provided path', function() {
         
         var rootFolder = '/var/www/base';
         
         var propertyHelper = new FilePropertyHelper(optionals);
         
         propertyHelper.getLastModifiedTimeOfFilesIn(rootFolder);
         
         expect(capturedPath).to.be.eql(rootFolder);

      });   
      
      it('requests the last modification time of each file', function() {
         
         var rootFolder = '/another/path';
         var fileA = 'fileA.txt';
         var fileB = 'scriptB.js';
         var fileC = 'readmeC.htm';
         
         var propertyHelper = new FilePropertyHelper(optionals);
         
         givenTheFolder(rootFolder).contains(fileA);
         givenTheFolder(rootFolder).contains(fileB);
         givenTheFolder(rootFolder).contains(fileC);
         
         propertyHelper.getLastModifiedTimeOfFilesIn(rootFolder);
         
         expect(requestedPropertyOfFiles).to.be.eql([rootFolder + '/' + fileA, rootFolder + '/' + fileB, rootFolder + '/' + fileC]);
      });
      
      it('returns the last modification times of all files in the folder', function() {
         
         var rootFolder = '/opt/my/prog';
         var fileA = 'aaa.txt';
         var fileB = 'bb.js';
         var fileC = 'cccc.htm';
         var timestamp1 = '11/30/2015 13:37:03';
         var timestamp2 = '11/30/2015 13:37:02';
         var timestamp3 = '11/30/2015 13:37:01';
         
         var propertyHelper = new FilePropertyHelper(optionals);
         
         givenTheFolder(rootFolder).contains(fileA);
         givenTheFolder(rootFolder).contains(fileB);
         givenTheFolder(rootFolder).contains(fileC);
         
         givenTheFile(rootFolder + '/' + fileA).wasLastModifiedOn(timestamp1);
         givenTheFile(rootFolder + '/' + fileB).wasLastModifiedOn(timestamp2);
         givenTheFile(rootFolder + '/' + fileC).wasLastModifiedOn(timestamp3);
         
         var expectedTimeStamps = {};
            
         expectedTimeStamps[rootFolder + '/' + fileA] = timestamp1;
         expectedTimeStamps[rootFolder + '/' + fileB] = timestamp2;
         expectedTimeStamps[rootFolder + '/' + fileC] = timestamp3;
         
         var capturedTimeStamps = propertyHelper.getLastModifiedTimeOfFilesIn(rootFolder);
         
         expect(capturedTimeStamps).to.be.eql(expectedTimeStamps);
      });
   });
 });