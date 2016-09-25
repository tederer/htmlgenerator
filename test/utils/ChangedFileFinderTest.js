/* global global, ChangedFileFinder */

var sourceWebRootFolder = '/var/web/myRoot';
var files = [];
var storedLastModifiedTimestamps = {};
var currentModifiedTimeOf= {};

var lastModificationTimesOfTargetFiles = '/any/path/lastHtmlFilesSnapshot.json';
var lastModificationTimesOfTargetFilesExists;


var fileSystem = {
   
   getUtf8FileContent: function getUtf8FileContent(absolutePathOfFile) {
      
      if (!lastModificationTimesOfTargetFilesExists) {
         
         throw new Error(absolutePathOfFile + ' does not exist !');
         
      } else {
         
         if (absolutePathOfFile === lastModificationTimesOfTargetFiles) {
            
            return JSON.stringify(storedLastModifiedTimestamps);
            
         } else {
            
            return undefined;
         }
      }
   }
};


var filePropertyHelper = {
   getLastModifiedTimeOfFilesIn: function getLastModifiedTimeOfFilesIn(absolutPathOfRootFolder) {
      
      var result;
      
      if (absolutPathOfRootFolder === sourceWebRootFolder) {
         
         result = {};
         files.forEach(function(path) { result[path] = currentModifiedTimeOf[path];});         
      } 
      
      return result;
   }
};


var optionals = {
   alternativeFileSystem: fileSystem,
   alternativeFilePropertyHelper: filePropertyHelper
};

         
var CallbackCaptor = function CallbackCaptor() {
   
   var capturedValues;
   var callbackPending = true;

   var callback = function callback(error, changedFiles) {
      capturedValues = { error: error, changedFiles: changedFiles };
      callbackPending = false;
   };

   this.getCallback = function getCallback() {
      return callback;
   };
   
   this.waitForCallback = function waitForCallback() {
      while (callbackPending) {}
      return capturedValues;
   };
}; 


var equal = function equal(expectedValue) {

   var expectToBe = function expectToBe(actualValue) {
      expect(actualValue).to.be.eql(expectedValue);
   };
   
   return expectToBe;
};


var isNotNull = function isNotNull(actualValue) {
   expect(actualValue).to.not.eql(null);
};


var isNull = function isNull(actualValue) {
   expect(actualValue).to.eql(null);
};


var changedFiles = function changedFiles(capturedValues) {
   return capturedValues.changedFiles.changedFiles;
};


var addedFiles = function addedFiles(capturedValues) {
   return capturedValues.changedFiles.addedFiles;
};


var deletedFiles = function deletedFiles(capturedValues) {
   return capturedValues.changedFiles.deletedFiles;
};


var allFiles = function allFiles(capturedValues) {
   return capturedValues.changedFiles;
};


var error = function error(capturedValues) {
   return capturedValues.error;
};


var assertThat = function assertThat(getActualValue, checkActualValue) {

   var captor = new CallbackCaptor();
   var changedFileFinder = new ChangedFileFinder(lastModificationTimesOfTargetFiles, optionals);

   changedFileFinder.getChangedFilesIn(sourceWebRootFolder, captor.getCallback());
   
   var capturedValues = captor.waitForCallback();
   var actualValue = getActualValue(capturedValues);
   
   checkActualValue(actualValue);
};

var assertThatChangedFilesEquals = function assertThatChangedFilesEquals(expectedValue) {
   assertThat(changedFiles, equal(expectedValue));
};


var assertThatAddedFilesEquals = function assertThatAddedFilesEquals(expectedValue) {
   assertThat(addedFiles, equal(expectedValue));
};


var assertThatDeletedFilesEquals = function assertThatDeletedFilesEquals(expectedValue) {
   assertThat(deletedFiles, equal(expectedValue));
};


var assertThatAllFilesEqual = function assertThatAllFilesEqual(expectedValue) {
   assertThat(allFiles, equal(expectedValue));
};


var assertAnErrorGetsReported = function assertAnErrorGetsReported() {
   assertThat(error, isNotNull);
};


var assertNoErrorGetsReported = function assertNoErrorGetsReported() {
   assertThat(error, isNull);
};


var setup = function setup() {
   storedLastModifiedTimestamps = {};
   currentModifiedTimeOf = {};
   lastModificationTimesOfTargetFilesExists = true;
};


describe('ChangedFileFinder', function() {
	
   describe('getChangedFilesIn', function() {
      
      describe('changedFiles', function() {
      
         beforeEach(setup);
      
         it('should not contain the file when its last modified timestamp is the same as the stored one', function() {
            
            var fileA = 'a.htm';
            
            files = [fileA];
            
            storedLastModifiedTimestamps[fileA] = '12/27/2015 16:37:01';
            
            currentModifiedTimeOf[fileA] = '12/27/2015 16:37:01';
            
            assertThatChangedFilesEquals([]);
         });
      
         it('should not contain the file when its last modified timestamp is older than the stored one', function() {
            
            var fileA = 'a.htm';
            
            files = [fileA];
            
            storedLastModifiedTimestamps[fileA] = '12/27/2015 16:37:01';
            
            currentModifiedTimeOf[fileA] = '12/27/2015 16:37:00';
            
            assertThatChangedFilesEquals([]);
         });      
         
         it('should contain the file when its last modified timestamp is newer than the stored one', function() {
            
            var fileA = 'bla.htm';
            
            files = [fileA];
            
            storedLastModifiedTimestamps[fileA] = '11/30/2015 13:37:01';
            
            currentModifiedTimeOf[fileA] = '11/30/2015 13:37:02';
            
            assertThatChangedFilesEquals([fileA]);
         });
         
         it('should contain the two modified files when all files existed before', function() {
            
            var fileA = 'a.htm';
            var fileB = 'B.jpg';
            var fileC = 'c_textfile.txt';
            var fileD = 'd.htm';
            
            files = [fileA, fileB, fileC, fileD];
            
            storedLastModifiedTimestamps[fileA] = '11/30/2015 13:37:01';
            storedLastModifiedTimestamps[fileB] = '11/30/2015 14:12:47';
            storedLastModifiedTimestamps[fileC] = '11/30/2015 09:22:11';
            storedLastModifiedTimestamps[fileD] = '11/30/2015 22:44:55';
            
            currentModifiedTimeOf[fileA] = '11/30/2015 13:37:01';
            currentModifiedTimeOf[fileB] = '12/01/2015 08:00:02';
            currentModifiedTimeOf[fileC] = '11/30/2015 10:02:01';
            currentModifiedTimeOf[fileD] = '11/30/2015 22:44:55';
            
            assertThatChangedFilesEquals([fileB, fileC]);
         });     
         
         it('should contain the modified file when three of four files existed before', function() {
            
            var fileA = 'a.htm';
            var fileB = 'B.jpg';
            var fileC = 'c_textfile.txt';
            var fileD = 'd.htm';
            
            files = [fileA, fileB, fileC, fileD];
            
            storedLastModifiedTimestamps[fileA] = '11/30/2015 13:37:01';
            storedLastModifiedTimestamps[fileB] = '11/30/2015 14:12:47';
            storedLastModifiedTimestamps[fileD] = '11/30/2015 22:44:55';
            
            currentModifiedTimeOf[fileA] = '11/30/2015 13:37:01';
            currentModifiedTimeOf[fileB] = '11/30/2015 14:12:47';
            currentModifiedTimeOf[fileC] = '11/30/2015 09:22:11';
            currentModifiedTimeOf[fileD] = '11/30/2015 22:44:56';
            
            assertThatChangedFilesEquals([fileD]);
         });
      }); 
      
      describe('addedFiles', function() {
      
         beforeEach(setup);
      
         it('should contain all current files when no timestamp file exists', function() {
            
            lastModificationTimesOfTargetFilesExists = false;
            
            files = ['et.htm', 'bla.htm'];
            files.forEach(function(f) { currentModifiedTimeOf[f] = '12/27/2015 16:54:23'; });
            
            assertThatAddedFilesEquals(files);
         });
         
         it('should not report an error when no timestamp file exists', function() {
            
            lastModificationTimesOfTargetFilesExists = false;
            
            files = ['et.htm', 'bla.htm'];
            files.forEach(function(f) { currentModifiedTimeOf[f] = '12/27/2015 16:54:23'; });
            
            assertNoErrorGetsReported();
         });
         
         it('should contain the two added files when two other files already existed before', function() {
            
            var fileA = 'a.htm';
            var fileB = 'B.jpg';
            var fileC = 'c_textfile.txt';
            var fileD = 'd.htm';
            
            files = [fileA, fileB, fileC, fileD];
            
            storedLastModifiedTimestamps[fileB] = '11/30/2015 14:12:47';
            storedLastModifiedTimestamps[fileD] = '11/30/2015 22:44:55';
            
            currentModifiedTimeOf[fileA] = '11/30/2015 13:37:01';
            currentModifiedTimeOf[fileB] = '11/30/2015 14:12:47';
            currentModifiedTimeOf[fileC] = '11/30/2015 09:22:11';
            currentModifiedTimeOf[fileD] = '11/30/2015 22:44:56';
            
            assertThatAddedFilesEquals([fileA, fileC]);
         });
      });
   
      describe('deletedFiles', function() {
      
         beforeEach(setup);
      
         it('should contain the file which exists in the stored timestamps but not in the filesystem', function() {
            
            var fileA = 'a.htm';
            
            files = [];
            
            storedLastModifiedTimestamps[fileA] = '11/30/2015 14:12:47';
            
            assertThatDeletedFilesEquals([fileA]);
         });
         
         it('should contain the two deleted files when one other file continued to exist', function() {
            
            var fileA = 'a.htm';
            var fileB = 'B.jpg';
            var fileC = 'c_textfile.txt';
            
            files = [fileB];
            
            storedLastModifiedTimestamps[fileA] = '11/30/2015 14:12:47';
            storedLastModifiedTimestamps[fileB] = '11/30/2015 14:12:47';
            storedLastModifiedTimestamps[fileC] = '11/30/2015 22:44:55';
            
            currentModifiedTimeOf[fileB] = '11/30/2015 14:12:47';
            
            assertThatDeletedFilesEquals([fileA, fileC]);
         });
      });
      
      describe('combined tests', function() {
         
         beforeEach(setup);
      
         it('test 1', function() {
            
            var fileA = 'a.htm';
            var fileB = 'B.jpg';
            var fileC = 'c_textfile.txt';
            var fileD = 'initializer.js';
            
            files = [fileA, fileB, fileD];
            
            storedLastModifiedTimestamps[fileB] = '11/30/2015 14:12:47';
            storedLastModifiedTimestamps[fileC] = '11/30/2015 22:44:55';
            storedLastModifiedTimestamps[fileD] = '07/29/2014 20:00:15';
            
            currentModifiedTimeOf[fileA] = '11/30/2015 14:12:47';
            currentModifiedTimeOf[fileB] = '12/07/2015 09:13:07';
            currentModifiedTimeOf[fileD] = '07/29/2014 20:00:15';
            
            var expectedValue = {
               changedFiles: [fileB],
               addedFiles: [fileA],  
               deletedFiles: [fileC] 
            };
            
            assertThatAllFilesEqual(expectedValue);
         });
         
         it('test 2', function() {
            
            var fileA = 'a.htm';
            var fileB = 'B.jpg';
            var fileC = 'c_textfile.txt';
            var fileD = 'initializer.js';
            var fileE = 'content.html';
            var fileF = 'statistic.xml';
            var fileG = 'logo.svg';
            var fileH = 'pic1.jpg';
            var fileI = 'pic2.gif';
            var fileJ = 'pic3.png';
            
            files = [fileA, fileB, fileD, fileE, fileF, fileG];
            
            storedLastModifiedTimestamps[fileB] = '11/30/2015 14:12:47';
            storedLastModifiedTimestamps[fileC] = '11/30/2015 22:44:55';
            storedLastModifiedTimestamps[fileD] = '07/29/2014 20:00:15';
            storedLastModifiedTimestamps[fileF] = '07/29/2014 20:00:15';
            storedLastModifiedTimestamps[fileG] = '07/29/2014 20:00:15';
            storedLastModifiedTimestamps[fileH] = '07/29/2014 20:00:15';
            storedLastModifiedTimestamps[fileI] = '07/29/2014 20:00:15';
            storedLastModifiedTimestamps[fileJ] = '07/29/2014 20:00:15';
            
            currentModifiedTimeOf[fileA] = '11/30/2015 14:12:47';
            currentModifiedTimeOf[fileB] = '12/07/2015 09:13:07';
            currentModifiedTimeOf[fileD] = '07/29/2014 20:00:15';
            currentModifiedTimeOf[fileE] = '07/29/2014 20:00:15';
            currentModifiedTimeOf[fileF] = '12/07/2015 09:13:07';
            currentModifiedTimeOf[fileG] = '12/07/2015 09:13:07';
            
            var expectedValue = {
               changedFiles: [fileB, fileF, fileG],
               addedFiles: [fileA, fileE],  
               deletedFiles: [fileC, fileH, fileI, fileJ] 
            };
            
            assertThatAllFilesEqual(expectedValue);
         });
      });
      
      describe('JSON parsing error handling', function() {
      
         beforeEach(setup);
      
         it('an error gets reported when the content of the timestamp file can not be parsed', function() {
            
            optionals.alternativeFileSystem = {
               
               getUtf8FileContent: function getUtf8FileContent(absolutePathOfFile) {
                  return 'file content of a broken JSON file';
               }
            };
            
            var fileA = 'a.htm';
            
            files = [fileA];
            
            storedLastModifiedTimestamps[fileA] = '11/30/2015 14:12:47';
            
            currentModifiedTimeOf[fileA] = '11/30/2015 14:12:47';
            
            assertAnErrorGetsReported();
         });
      });
   });
 });