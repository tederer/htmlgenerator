/* global global, EmptyFolderRemover, ReduceFunctions */

var removedFolders;
var folders;
var filesOfFolder;
var folderRemover;


var mockedFileSystem = {
   remove:  function remove(absolutePath) {
      
      removedFolders.push(absolutePath);
      
      var indexOfAbsolutePath = folders.indexOf(absolutePath);
      
      if (indexOfAbsolutePath >= 0) {
         var deleteCount = 1;
         folders.splice(indexOfAbsolutePath, deleteCount);
      }
   },
   
   readDir: function readDir(absolutePathOfFolder) {
      var returnValue = [];
      
      folders.forEach(function(currentFolder) {
         
         var indexOfFolder = currentFolder.indexOf(absolutePathOfFolder);
         
         if (indexOfFolder === 0) {
         
            var relativePath = currentFolder.substr(absolutePathOfFolder.length + 1);
            var indexOfNextSlash = relativePath.indexOf('/');
            
            var subfolder = (indexOfNextSlash > 0) ? relativePath.substr(0, indexOfNextSlash) : relativePath;
            
            if (subfolder.length > 0) {
               returnValue.push(subfolder);
            }
         }
      });
      
      var files = filesOfFolder[absolutePathOfFolder];
      
      if (files === undefined) {
         files = [];
      }
      
      files.forEach(function(file) {
         returnValue.push(file);
      });
      
      return returnValue.sort().reduce(ReduceFunctions.unique, []);
   },
   
   isDirectory: function isDirectory(absolutePath) {
      var isDir = false;
      
      for (var index = 0; index < folders.length && !isDir; index++) {
         var folder = folders[index];

         if (absolutePath === folder || folder.indexOf(absolutePath + '/') === 0) {
            isDir = true;
         }
      }
      return isDir;
   }
};


var optionals = {
   alternativeFileSystem: mockedFileSystem
};


var setup = function setup() {
   removedFolders = [];
   folders = [];
   filesOfFolder = {};
   folderRemover = new EmptyFolderRemover(optionals);
};

    
var givenTheFolder = function givenTheFolder(absolutePathOfFolder) {
   
   if (folders.indexOf(absolutePathOfFolder) === -1) {
      folders.push(absolutePathOfFolder);
   }
   
   return {
      containsTheFile: function containsTheFile(filename) {
         var folderContent = filesOfFolder[absolutePathOfFolder];
         
         if (folderContent === undefined) {
            folderContent = [];
         }
         
         folderContent.push(filename);
         
         filesOfFolder[absolutePathOfFolder] = folderContent;
      }
   };
};  

  
describe('EmptyFolderRemover', function() {
	
   describe('clean', function() {

      beforeEach(setup);
      
      it('should not remove anything when the root folder is empty', function() {
         
         var rootFolder = 'D:/var/www/germination';
         
         folderRemover.clean(rootFolder);
         
         expect(removedFolders).to.be.eql([]);
      });

      it('should remove an empty subfolder', function() {
         
         var rootFolder = 'D:/var/www/germination';
         var subfolder = 'sub1';
         
         givenTheFolder(rootFolder + '/' + subfolder);
         
         folderRemover.clean(rootFolder);
         
         expect(removedFolders).to.be.eql([rootFolder + '/' + subfolder]);
      });

      it('should not remove a subfolder which contains a file', function() {
         
         var rootFolder = 'D:/var/www/germination';
         var subfolder1 = 'sub1';
         var subfolder2 = 'sub2';
         var file = 'test.txt';
         
         givenTheFolder(rootFolder + '/' + subfolder1).containsTheFile(file);
         givenTheFolder(rootFolder + '/' + subfolder1 + '/' + subfolder2);
         
         folderRemover.clean(rootFolder);
         
         expect(removedFolders).to.be.eql([rootFolder + '/' + subfolder1 + '/' + subfolder2]);
      });

      it('should remove recursive existing empty subfolders', function() {
         
         var rootFolder = 'D:/var/www/germination';
         var subfolder1 = 'sub1';
         var subfolder2 = 'sub2';
         var subfolder3 = 'sub3';
         var subfolder4 = 'sub4';
         
         givenTheFolder(rootFolder + '/' + subfolder1 + '/' + subfolder2 + '/' + subfolder3);
         givenTheFolder(rootFolder + '/' + subfolder1 + '/' + subfolder2 + '/' + subfolder4);
         
         folderRemover.clean(rootFolder);
         
         expect(removedFolders).to.be.eql([
               rootFolder + '/' + subfolder1 + '/' + subfolder2 + '/' + subfolder3,
               rootFolder + '/' + subfolder1 + '/' + subfolder2 + '/' + subfolder4,
               rootFolder + '/' + subfolder1 + '/' + subfolder2, 
               rootFolder + '/' + subfolder1
            ]);
      });

      it('should return a list of the removed folders', function() {
         
         var rootFolder = 'D:/var/www/germination';
         var level1a = 'level1a';
         var level1b = 'level1b';
         var level2a = 'level2a';
         var level2b = 'level2b';
         var level3a = 'level3a';
         
         givenTheFolder(rootFolder + '/' + level1a + '/' + level2a);
         givenTheFolder(rootFolder + '/' + level1b + '/' + level2b + '/' + level3a);
         
         var returnValue = folderRemover.clean(rootFolder);
         
         expect(returnValue).to.be.eql([
               rootFolder + '/' + level1a + '/' + level2a,
               rootFolder + '/' + level1a,
               rootFolder + '/' + level1b + '/' + level2b + '/' + level3a,
               rootFolder + '/' + level1b + '/' + level2b,
               rootFolder + '/' + level1b
            ]);
      });
   });
 });