/* global global */
'use strict';
  
global.LOGFILENAME = 'D:/Webseite_HTML5/updateWebpage.log';
global.SOURCE_FILE_PATHS = ['D:/Webseite_HTML5/ContentGenerator/src/generators', 'D:/Webseite_HTML5/ContentGenerator/src/utils'];

var SOURCE_WEB_ROOT_FOLDER = 'D:/Webseite_HTML5/orchideenvermehrung.at/htdocs';
var SOURCE_INCLUDES_FOLDER = 'D:/Webseite_HTML5/orchideenvermehrung.at/htdocs/includes';
var TARGET_WEB_ROOT_FOLDER = 'D:/Webseite_HTML5/orchideenvermehrung.at/generatedWebpage';

var NO_REFERENCE_CHECKING_FOR_IMAGES_IN_FOLDER = [ SOURCE_WEB_ROOT_FOLDER + '/liste/', 
                                                   SOURCE_WEB_ROOT_FOLDER + '/zubehoer/', 
                                                   SOURCE_WEB_ROOT_FOLDER + '/presse/images/'];
                                                   
var LAST_MODIFICATION_TIMES_OF_SOURCE_FILES = 'D:/Webseite_HTML5/orchideenvermehrung.at/TimestampsSnapshot.json';

var FILES_TO_USE_WITHOUT_MODIFICATION = [
                                    '/aussaat/diocentrum.htm', 
                                    '/aussaat/phalaenopsis.htm', 
                                    '/aussaat/burrageara.htm', 
                                    '/aussaat/oncidium.htm', 
                                    '/aussaat/paphiopedilum.htm',
                                    '/english/seed germination/diocentrum.htm',
                                    '/english/seed germination/phalaenopsis.htm',
                                    '/english/seed germination/burrageara.htm',
                                    '/english/seed germination/oncidium.htm',
                                    '/english/seed germination/paphiopedilum.htm',
                                    '/gym/vokabeltrainer/index.htm',
                                    '/gym/vokabeltrainer/online/index.htm'];
      
// Grunt is a JavaScript task runner, similar to Ant. 
// See http://gruntjs.com/ for details

module.exports = function(grunt) {

   var tasksToExecute = grunt.cli.tasks;
   
   if ((tasksToExecute.length === 0) || (tasksToExecute.indexOf('test') >= 0)) {
      require('./src/utils/Logger.js').enableConsoleOutput(false);
   }
   
   var path = require('path');
   var imageChecker = require('./src/utils/ImageChecker.js');
   var nonReferencedImagesFinder = require('./src/utils/NonReferencedImagesFinder.js');
   var utf8Checker = require('./src/utils/Utf8Checker.js');
   var ChangedFileFinder = require('./src/utils/ChangedFileFinder.js');
   var FileSynchronizer = require('./src/utils/FileSynchronizer.js');
   var ReduceFunctions = require('./src/utils/ReduceFunctions.js');
   var FilterFunctions = require('./src/utils/FilterFunctions.js');
   var SynchronizationAgent = require('./src/generators/SynchronizationAgent.js');
   var SequentialHtmlGenerator = require('./src/generators/SequentialHtmlGenerator.js');
   var EmptyFolderRemover = require('./src/utils/EmptyFolderRemover.js');
   var FilePropertyHelper = require('./src/utils/FilePropertyHelper.js');
   var FileSystem =  require('./src/utils/FileSystem.js');
   var logger = require('./src/utils/Logger.js').getLoggerFor('Gruntfile');

   logger.debug('');
   logger.debug('--- NEW GRUNT RUN ---');
   logger.debug('');

   var fileSynchronizer = new FileSynchronizer(SOURCE_WEB_ROOT_FOLDER, TARGET_WEB_ROOT_FOLDER);

   var jsFiles = ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'];
   var fileFinderResult;

   grunt.initConfig({
   pkg: grunt.file.readJSON('package.json'),

    // Run JSHint on all sources. JSHint is a linter that checks for specific
    // formatting rules and/or coarse syntax checks. The file '.jshintrc'
    // contains the settings.
    // See http://jshint.org/about/ for details
   jshint: {
      allButNotSettings : {
         options: {
            jshintrc: '.jshintrc'
         },
         src: jsFiles
      }
   },

   // JSBeautifier on all sources. This formats the source code according to
   // the settings, stored in '.jsbeautifyrc'.
   // See http://jsbeautifier.org/ for details
   jsbeautifier: {
   standard: {
     src: jsFiles,
     options: {
       js: grunt.file.readJSON('.jsbeautifyrc')
     }
   }
   },

   // Run tests using mocha. Mocha is one of the more commonly used test
   // frameworks.
   // See http://visionmedia.github.io/mocha/ for details
   mochaTest: {
   libRaw: {
     options: {
       require: ['./test/testGlobals.js', './test/testStandard.js'],
       reporter: 'spec'
     },
     src: ['test/**/*Test.js']
   }
   },
	
   /*concat: {
      options: {},
      dist: {
         src: ['src/generators/*.js', 'settings/registerStartupHandler.js'],
         dest: 'javascript/webserver.js'
      }
   },*/

   copy: {
      main: {
         expand: true,
         flatten: true,
         src: ['jquery/*.js'],
         dest: 'javascript/'
      }
   },

   clean: ['javascript']
   });

   grunt.loadNpmTasks('grunt-jsbeautifier');
   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-mocha-test');
   //grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-clean');

   grunt.registerTask('lint', ['jshint']);
   grunt.registerTask('format', ['jsbeautifier']);
   grunt.registerTask('test', ['mochaTest:libRaw']);
   grunt.registerTask('compile', []);

   grunt.registerTask('findReferencedImagesWhichDoNotExist', function() {
      return imageChecker.check(SOURCE_WEB_ROOT_FOLDER);
  });
   
   grunt.registerTask('findNoneReferenceImages', function() {
      return nonReferencedImagesFinder.check(SOURCE_WEB_ROOT_FOLDER, NO_REFERENCE_CHECKING_FOR_IMAGES_IN_FOLDER );
   });
   
   grunt.registerTask('checkUtf8', function() {
      return utf8Checker.check(SOURCE_WEB_ROOT_FOLDER);
   });
   
   grunt.registerTask('getListOfModifiedFiles', function() {
   
      var fileFinder = new ChangedFileFinder(LAST_MODIFICATION_TIMES_OF_SOURCE_FILES);
      
      var done = this.async();
      
      fileFinder.getChangedFilesIn(SOURCE_WEB_ROOT_FOLDER, function(error, data) {
         
         var finishedWithoutErrors = false;
         
         if (error) {
            grunt.log.error('fileFinder returned: "' + error + '"');
         } else {
            fileFinderResult = data;
            finishedWithoutErrors = true;
         }
         
         done(finishedWithoutErrors);
      });
   });
   
   grunt.registerTask('removeDeletedFiles', function() {
   
      fileSynchronizer.remove(fileFinderResult.deletedFiles);
   });
   
   grunt.registerTask('copyAddedOrChangedNonHtmlFiles', function() {
   
      var done = this.async();
      
      var removeTemplates = ReduceFunctions.getRemoveEntriesWithPrefixFunction(SOURCE_INCLUDES_FOLDER);
      
      var addedFiles = fileFinderResult.addedFiles.reduce(removeTemplates, []).reduce(ReduceFunctions.removeHtmlFiles, []);
      var changedFiles = fileFinderResult.changedFiles.reduce(removeTemplates, []).reduce(ReduceFunctions.removeHtmlFiles, []);
      
      var filesToCopy = addedFiles.concat(changedFiles).sort().reduce(ReduceFunctions.unique, []);
      
      fileSynchronizer.copyFiles(filesToCopy, function() { done(true); } );
   });   
   
   grunt.registerTask('generateHtmlFiles', function() {
   
      var done = this.async();
      
      var sequentialHtmlGenerator = new SequentialHtmlGenerator(  SOURCE_WEB_ROOT_FOLDER, 
                                                                  TARGET_WEB_ROOT_FOLDER, 
                                                                  SOURCE_INCLUDES_FOLDER, 
                                                                  FILES_TO_USE_WITHOUT_MODIFICATION);
      
      var synchronizationAgent = new SynchronizationAgent(        SOURCE_WEB_ROOT_FOLDER, 
                                                                  SOURCE_INCLUDES_FOLDER, 
                                                                  sequentialHtmlGenerator.getIncludes());
                                                                  
      var filesToGenerate = synchronizationAgent.getHtmlFilesWhichNeedToBeGenerated(fileFinderResult);
      var error;
      
      if (filesToGenerate.length > 0) {
      
         console.log('\n\tgenerating ' + filesToGenerate.length + ' file(s) ...');
         
         try {
            
            sequentialHtmlGenerator.generate(filesToGenerate);
            
         } catch (e) {
            
            error = e;
            console.log('ERROR: ' + e.message);
         }
      }
      
      done(error === undefined);
   });
   
   grunt.registerTask('removeEmptyFolders', function() {
   
      var emptyFolderRemover = new EmptyFolderRemover();
      
      var removeEmptyFolders = emptyFolderRemover.clean(TARGET_WEB_ROOT_FOLDER);
      
      if (removeEmptyFolders.length > 0) {
         console.log();
         console.log('removed folders:');
         removeEmptyFolders.forEach(function(folder) { console.log('\t' + folder);} );
         console.log();
      }
   });
   
   grunt.registerTask('storeLastModificationTimesOfSourceFiles', function() {
   
      var filePropertyHelper = new FilePropertyHelper();
      var fileSystem = new FileSystem();
      
      var timestampSnapshot = filePropertyHelper.getLastModifiedTimeOfFilesIn(SOURCE_WEB_ROOT_FOLDER);
      
      fileSystem.writeFile(LAST_MODIFICATION_TIMES_OF_SOURCE_FILES, JSON.stringify(timestampSnapshot, undefined, 3));
   });
   
   grunt.registerTask('default', ['lint', 'test', 'compile', 'clean']);
   grunt.registerTask('checkWebpage', ['findReferencedImagesWhichDoNotExist', 'findNoneReferenceImages', 'checkUtf8']);
   grunt.registerTask('updateWebpage', ['checkWebpage', 'getListOfModifiedFiles', 'removeDeletedFiles', 'copyAddedOrChangedNonHtmlFiles', 'generateHtmlFiles', 'removeEmptyFolders', 'storeLastModificationTimesOfSourceFiles']);
 };
