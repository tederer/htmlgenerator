/* global global, FileSynchronizer */

var SOURCE_WEB_ROOT_FOLDER = 'AnySource';
var TARGET_WEB_ROOT_FOLDER = 'AnyTarget';

var addedSourceFiles;
var deletedSourceFiles;
var expectedRequests;
var expectedCreatedFolders;
var expectedDeletedFolders;
var copyRequests;
var createdFolders;
var deletedFolders;
var stats;
var fileSynchronizer;


var addToAddedSourceFiles = function addToAddedSourceFiles(path) {
   addedSourceFiles.push(path);
};


var addToDeletedSourceFiles = function addToDeletedSourceFiles(path) {
   deletedSourceFiles.push(path);
};


var addToExpectedRequests = function addToExpectedRequests(sourcePath, targetPath) {
   expectedRequests.push([sourcePath, targetPath]);
};


var addToExpectedCreatedFolders = function addToExpectedCreatedFolders(path) {
   expectedCreatedFolders.push(path);
   expectedCreatedFolders = expectedCreatedFolders.sort();
};


var addToExpectedDeletedFolders = function addToExpectedDeletedFolders(path) {
   expectedDeletedFolders.push(path);
};


var copyFile = function copyFile(sourcePath, targetPath, actionOnFinish) {
   copyRequests.push([sourcePath, targetPath]);
   actionOnFinish();
};


var getStatsOf = function getStatsOf(path) {
   return stats[path];
};


var mkdirWithParents = function mkdirWithParents(path) {
   createdFolders.push(path);
};


var remove = function remove(path) {
   deletedFolders.push(path);
};


var optionals = {
   
   alternativeFileSystem: {
      copyFile: copyFile,
      getStatsOf: getStatsOf,
      remove: remove,
      mkdirWithParents: mkdirWithParents
   },
   
   alternativeLogger: {
      info: function info(text) {},
      debug: function debug(text) {}
   }
};


var setup = function setup() {
   
   addedSourceFiles = [];
   deletedSourceFiles = [];
   expectedRequests = [];
   expectedCreatedFolders = [];
   expectedDeletedFolders = [];
   copyRequests = [];
   createdFolders = [];
   deletedFolders = [];
   stats = {};

   stats[SOURCE_WEB_ROOT_FOLDER] = { isDirectory: function() {return true;} };
   stats[TARGET_WEB_ROOT_FOLDER] = { isDirectory: function() {return true;} };
   
   fileSynchronizer = new FileSynchronizer(SOURCE_WEB_ROOT_FOLDER, TARGET_WEB_ROOT_FOLDER, optionals);
};

         
describe('FileSynchronizer', function() {
	
   describe('copyFiles', function() {

      beforeEach(setup);
      
      it('should create a target folder only once when more than one file of this folder gets copied', function() {
         
         var source1 = SOURCE_WEB_ROOT_FOLDER + '/aussaat/asymbiotisch/logo.png';
         var source2 = SOURCE_WEB_ROOT_FOLDER + '/aussaat/asymbiotisch/index.htm';
         var source3 = SOURCE_WEB_ROOT_FOLDER + '/aussaat/asymbiotisch/samen.htm';
         var source4 = SOURCE_WEB_ROOT_FOLDER + '/javascripts/statistics.js';
         
         addToAddedSourceFiles(source1);
         addToAddedSourceFiles(source2);
         addToAddedSourceFiles(source3);
         addToAddedSourceFiles(source4);
         
         addToExpectedCreatedFolders(TARGET_WEB_ROOT_FOLDER + '/javascripts');
         addToExpectedCreatedFolders(TARGET_WEB_ROOT_FOLDER + '/aussaat/asymbiotisch');
         
         fileSynchronizer.copyFiles(addedSourceFiles, function() {} );
         
         expect(createdFolders).to.be.eql(expectedCreatedFolders);
      });
      
      it('should create the target folders', function() {
         
         var source1 = SOURCE_WEB_ROOT_FOLDER + '/index.htm';
         var source2 = SOURCE_WEB_ROOT_FOLDER + '/css/styles.css';
         var source3 = SOURCE_WEB_ROOT_FOLDER + '/aussaat/asymbiotisch/samen.htm';
         
         addToAddedSourceFiles(source1);
         addToAddedSourceFiles(source2);
         addToAddedSourceFiles(source3);
         
         addToExpectedCreatedFolders(TARGET_WEB_ROOT_FOLDER + '/css');
         addToExpectedCreatedFolders(TARGET_WEB_ROOT_FOLDER + '/aussaat/asymbiotisch');
         
         fileSynchronizer.copyFiles(addedSourceFiles, function() {} );
         
         expect(createdFolders).to.be.eql(expectedCreatedFolders);
      });
      
      it('should copy the files', function() {
         
         var source1 = SOURCE_WEB_ROOT_FOLDER + '/index.htm';
         var source2 = SOURCE_WEB_ROOT_FOLDER + '/css/styles.css';
         
         var target1 = TARGET_WEB_ROOT_FOLDER + '/index.htm';
         var target2 = TARGET_WEB_ROOT_FOLDER + '/css/styles.css';
         
         addToAddedSourceFiles(source1);
         addToAddedSourceFiles(source2);
         
         addToExpectedRequests(source1, target1);
         addToExpectedRequests(source2, target2);
         
         fileSynchronizer.copyFiles(addedSourceFiles, function() {} );
         
         expect(copyRequests).to.be.eql(expectedRequests);
      });
   });
	
   describe('remove', function() {

      beforeEach(setup);
      
      it('should remove the deleted files', function() {
         
         var file1 = '/aussaat/asymbiotisch/samen.htm';
         var file2 = '/javascripts/statistics.js';
         var folder1 = '/statistics';
         
         var source1 = SOURCE_WEB_ROOT_FOLDER + file1;
         var source2 = SOURCE_WEB_ROOT_FOLDER + file2;
         var source3 = SOURCE_WEB_ROOT_FOLDER + folder1;
         
         addToDeletedSourceFiles(source1);
         addToDeletedSourceFiles(source2);
         addToDeletedSourceFiles(source3);
         
         addToExpectedDeletedFolders(TARGET_WEB_ROOT_FOLDER + file1);
         addToExpectedDeletedFolders(TARGET_WEB_ROOT_FOLDER + file2);
         addToExpectedDeletedFolders(TARGET_WEB_ROOT_FOLDER + folder1);
         
         fileSynchronizer.remove(deletedSourceFiles);
         
         expect(deletedFolders).to.be.eql(expectedDeletedFolders);
      });
      
   });
 });