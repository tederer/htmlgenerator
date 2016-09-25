/* global global, SynchronizationAgent, Include */

var sourceWebRootFolder = '/var/www/myWebpage';
var includesRootFolder = '/var/www/myWebpage/templates';
var includesOfEachHtmlFile;
var captureContainer;
var htmlFileSearchResults;
var fileContents;


var callback = function callback(error, list) {
   captureContainer.error = error;
   captureContainer.list = list;
};


var fileFinderResult = {
   changedFiles: [],
   addedFiles: [], 
   deletedFiles: [] 
};


var mockedFileFinder = {
   getHtmlFilesIn: function getHtmlFilesIn(path) {
      var listOfFiles = htmlFileSearchResults[path];
      return (listOfFiles === undefined) ? [] : listOfFiles;
   }
};


var mockedFileSystem = {
   getUtf8FileContent: function getUtf8FileContent(path) {
      return fileContents[path];
   }
};


var optionals = {
   alternativeFileFinder: mockedFileFinder,
   alternativeFileSystem: mockedFileSystem
};



var setup = function setup() {
   captureContainer = {};
   htmlFileSearchResults = {};
   fileContents = {};
   includesOfEachHtmlFile = [];
   fileFinderResult.changedFiles = [];
   fileFinderResult.addedFiles = [];
   fileFinderResult.deletedFiles = [];
};


var theSynchronizationAgentReturnsTheList = function theSynchronizationAgentReturnsTheList(expectedValue) {
      
   var synchronizationAgent = new SynchronizationAgent(sourceWebRootFolder, includesRootFolder, includesOfEachHtmlFile, optionals);
   var actualValue = synchronizationAgent.getHtmlFilesWhichNeedToBeGenerated(fileFinderResult, callback);
   expect(actualValue).to.be.eql(expectedValue);
};


var whenFileFinderSearchesForHtmlFilesIn = function whenFileFinderSearchesForHtmlFilesIn(path) {
   return {
      thenReturn: function thenReturn(listOfFiles) {
         htmlFileSearchResults[path] = listOfFiles;
      }
   };
};


var whenReadingFile = function whenReadingFile(path) {
   return {
      thenReturn: function thenReturn(content) {
         fileContents[path] = content;
      }
   };
};


describe('SynchronizationAgent', function() {
	
   describe('getHtmlFilesWhichNeedToBeGenerated', function() {

      beforeEach(setup);
      
      it('a changed HTML file should be part of the return list', function() {
         
         var fileA = sourceWebRootFolder + '/overview.htm';
         
         fileFinderResult.changedFiles.push(fileA);
         
         includesOfEachHtmlFile.push('/overview.htm');
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([fileA]);
         whenReadingFile(fileA).thenReturn('some content');
         
         theSynchronizationAgentReturnsTheList([fileA]);
      });
      
      it('an added HTML file should be part of the return list', function() {
         
         var fileA = sourceWebRootFolder + '/added.htm';
         
         fileFinderResult.addedFiles.push(fileA);
         
         includesOfEachHtmlFile.push('/added.htm');
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([fileA]);
         whenReadingFile(fileA).thenReturn('some content');
         
         theSynchronizationAgentReturnsTheList([fileA]);
      });
      
      it('a changed template file should not be part of the return list', function() {
         
         var fileA = includesRootFolder + '/overview.htm';
         
         fileFinderResult.changedFiles.push(fileA);
         
         includesOfEachHtmlFile.push('/overview.htm');
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([fileA]);
         whenReadingFile(fileA).thenReturn('some content');

         theSynchronizationAgentReturnsTheList([]);
      });
       
      it('an added template file should not be part of the return list', function() {
         
         var fileA = includesRootFolder + '/form.htm';
         
         fileFinderResult.addedFiles.push(fileA);
         includesOfEachHtmlFile.push('/form.htm');
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([fileA]);
         whenReadingFile(fileA).thenReturn('some content');
         
         theSynchronizationAgentReturnsTheList([]);
      });
       
      it('a changed nonHTML file should not be part of the return list', function() {
         
         var fileA = sourceWebRootFolder + '/test.js';
         
         fileFinderResult.changedFiles.push(fileA);
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([fileA]);

         theSynchronizationAgentReturnsTheList([]);
      });
       
       it('an added nonHTML file should not be part of the return list', function() {
         
         var fileA = sourceWebRootFolder + '/test.js';
         
         fileFinderResult.addedFiles.push(fileA);
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([fileA]);

         theSynchronizationAgentReturnsTheList([]);
      });
       
      it('a HTML file whose template file was changed should be part of the return list', function() {
         
         var relativeInclude = '/form.htm';
         var include = includesRootFolder + relativeInclude;
         var htmlFile = sourceWebRootFolder + '/index.htm';
         var includeText = Include.format(relativeInclude);
         var htmlFileContent = '<html><head><title>test</title>' + includeText + '</head><body></body></html>';
         
         fileFinderResult.changedFiles.push(include);
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([htmlFile]);
         
         whenReadingFile(htmlFile).thenReturn(htmlFileContent);
                  
         theSynchronizationAgentReturnsTheList([htmlFile]);
      });
       
      it('a HTML file whose template file was added should be part of the return list', function() {
         
         var relativeInclude = '/myInclude.htm';
         var include = includesRootFolder + relativeInclude;
         var htmlFile = sourceWebRootFolder + '/content.htm';
         var includeText = Include.format(relativeInclude);
         var htmlFileContent = '<html><head><title>my own webpage</title></head>' + includeText + '<body></body></html>';
         
         fileFinderResult.addedFiles.push(include);
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([htmlFile]);
         
         whenReadingFile(htmlFile).thenReturn(htmlFileContent);
                  
         theSynchronizationAgentReturnsTheList([htmlFile]);
      });
       
      it('a HTML file which contains two added template files should be part of the return list only once', function() {
         
         var relativeInclude1 = '/myInclude1.htm';
         var relativeInclude2 = '/anotherInclude.htm';
         var include1 = includesRootFolder + relativeInclude1;
         var include2 = includesRootFolder + relativeInclude2;
         var htmlFile = sourceWebRootFolder + '/content.htm';
         var includeText1 = Include.format(relativeInclude1);
         var includeText2 = Include.format(relativeInclude2);
         var htmlFileContent = '<html><head><title>my own webpage</title></head>' + includeText2 + includeText1 + '<body></body></html>';
         
         fileFinderResult.addedFiles.push(include1);
         fileFinderResult.addedFiles.push(include2);
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([htmlFile]);
         
         whenReadingFile(htmlFile).thenReturn(htmlFileContent);
                  
         theSynchronizationAgentReturnsTheList([htmlFile]);
      });
       
      it('a HTML file which contains two changed template files should be part of the return list only once', function() {
         
         var relativeInclude1 = '/donald.htm';
         var relativeInclude2 = '/daisy.htm';
         var include1 = includesRootFolder + relativeInclude1;
         var include2 = includesRootFolder + relativeInclude2;
         var htmlFile = sourceWebRootFolder + '/introduction.htm';
         var includeText1 = Include.format(relativeInclude1);
         var includeText2 = Include.format(relativeInclude2);
         var htmlFileContent = '<html><head><title>my company</title></head>' + includeText2 + ' ' + includeText1 + '<body></body></html>';
         
         fileFinderResult.changedFiles.push(include1);
         fileFinderResult.changedFiles.push(include2);
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([htmlFile]);
         
         whenReadingFile(htmlFile).thenReturn(htmlFileContent);
                  
         theSynchronizationAgentReturnsTheList([htmlFile]);
      });

      it('a HTML file which contains a changed template files added by the HtmlGenerator should be part of the return list', function() {
         
         var htmlGeneratorInclude = '/htmlGeneratorInclude.htm';
         var htmlFile = sourceWebRootFolder + '/introduction.htm';
         var htmlFileContent = '<html><head><title>my company</title></head><body></body></html>';
         
         includesOfEachHtmlFile.push(htmlGeneratorInclude);
         
         fileFinderResult.changedFiles.push(includesRootFolder + htmlGeneratorInclude);
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([htmlFile]);
         
         whenReadingFile(htmlFile).thenReturn(htmlFileContent);
                  
         theSynchronizationAgentReturnsTheList([htmlFile]);
      });

      it('combined test', function() {
         
         var relativeInclude1 = '/kelly.htm';
         var relativeInclude2 = '/bundy.htm';
         var include1 = includesRootFolder + relativeInclude1;
         var include2 = includesRootFolder + relativeInclude2;
         var htmlFile1 = sourceWebRootFolder + '/introduction1.htm';
         var htmlFile2 = sourceWebRootFolder + '/index2.htm';
         var htmlFile3 = sourceWebRootFolder + '/content3.htm';
         var htmlFile4 = sourceWebRootFolder + '/impressum4.htm';
         var includeText1 = Include.format(relativeInclude1);
         var includeText2 = Include.format(relativeInclude2);
         var htmlFileContent1 = '<html><head><title>my company</title></head>' + includeText2 + ' ' + includeText1 + '<body></body></html>';
         var htmlFileContent2 = 'some text here and some text there but no include :-)';
         var htmlFileContent3 = '<html><head><title>no include</title></head><body></body></html>';
         var htmlFileContent4 = '<html><head><title>one include</title></head><body>' + includeText2 + '</body></html>';
         
         fileFinderResult.addedFiles.push(htmlFile2);
         fileFinderResult.changedFiles.push(include1);
         fileFinderResult.changedFiles.push(include2);
         fileFinderResult.changedFiles.push(htmlFile4);
         
         whenFileFinderSearchesForHtmlFilesIn(sourceWebRootFolder).thenReturn([htmlFile1, htmlFile2, htmlFile3, htmlFile4]);
         
         whenReadingFile(htmlFile1).thenReturn(htmlFileContent1);
         whenReadingFile(htmlFile2).thenReturn(htmlFileContent2);
         whenReadingFile(htmlFile3).thenReturn(htmlFileContent3);
         whenReadingFile(htmlFile4).thenReturn(htmlFileContent4);
                  
         theSynchronizationAgentReturnsTheList([htmlFile1, htmlFile2, htmlFile4].sort());
      });
   });
 });