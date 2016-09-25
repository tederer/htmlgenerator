/* global global, SequentialHtmlGenerator */

var sourceWebRootFolder = '/any/source/web/root/folder';
var targetWebRootFolder = '/any/target/web/root/folder';
var includesRootFolder = '/any/includes/root/folder';

var filesToGenerate;
var readFiles;
var generatorInteractions;
var fileContentOf;
var createdTargetFolder;
var writtenFiles;
var generatorRactionFor;
var includesUsedByHtmlGenerator;
var filesToSendWithoutModifications;
var generator;
var capturedIncludes;


var mockedFileSystem = {
   getUtf8FileContent: function getUtf8FileContent(absoluteFilePath) {
      readFiles.push(absoluteFilePath);
      return fileContentOf[absoluteFilePath];
   },
   
   mkdirWithParents: function mkdirWithParents(absoluteTargetFolder) {
      createdTargetFolder.push(absoluteTargetFolder);
   },
   
   writeFile: function writeFile(absolutePathOfFile, content) {
      writtenFiles.push({path: absolutePathOfFile, content: content});
   }
};


var mockedHtmlGenerator = {
   generate: function generate(rawContent, requestedDocumentUrl, callback) {

      generatorInteractions.push({content:rawContent, url: requestedDocumentUrl});
      var reaction = generatorRactionFor[requestedDocumentUrl];
      
      if (reaction === undefined) {
         callback(null, 'undefined reaction');
      } else {
         callback(reaction.error, reaction.result);
      }
   },
   
   getIncludes: function getIncludes() {
      return includesUsedByHtmlGenerator;
   }
};


var optionals = {
   alternativeFileSystem: mockedFileSystem,
   alternativeHtmlGenerator: mockedHtmlGenerator
};


var whenReadingFile = function whenReadingFile(absoluteFilePath) {
   return {
      thenReturn: function thenReturn(content) {
         fileContentOf[absoluteFilePath] = content;
      }
   };
};


var whenInvokingGenerateWith = function whenInvokingGenerateWith(url) {
      return {
         thenInvokeCallbackWith: function thenInvokeCallbackWith(err, res) {
            generatorRactionFor[url] = {error: err, result: res};
         }
      };
};


var createGenerator = function createGenerator() {
   return new SequentialHtmlGenerator(sourceWebRootFolder, targetWebRootFolder, includesRootFolder, filesToSendWithoutModifications, optionals);
};


var whenTheGeneratorGenerates = function whenTheGeneratorGenerates(filesToGenerate) {
   
   var generator = createGenerator();
   generator.generate(filesToGenerate);
};


var whenGetIncludesGetsCalled = function whenGetIncludesGetsCalled() {
   
   var generator = createGenerator();
   capturedIncludes = generator.getIncludes();
};


var setup = function setup() {
   filesToGenerate = [];
   readFiles = [];
   generatorInteractions = [];
   fileContentOf = {};
   createdTargetFolder = [];
   writtenFiles = [];
   generatorRactionFor = {};
   includesUsedByHtmlGenerator = [];
   filesToSendWithoutModifications = [];
   capturedIncludes = undefined;
};


describe('SequentialHtmlGenerator', function() {
	
   describe('generate', function() {

      beforeEach(setup);
      
      it('the content of the provided files should be read', function() {
         
         var file1 = sourceWebRootFolder + '/file1.htm';
         var file2 = sourceWebRootFolder + '/file2.htm';
         var file3 = sourceWebRootFolder + '/file3.htm';
         
         filesToGenerate.push(file1);
         filesToGenerate.push(file2);
         filesToGenerate.push(file3);
         
         whenTheGeneratorGenerates(filesToGenerate);
         
         expect(readFiles).to.be.eql([file1, file2, file3]);
      });
      
      it('the HtmlGenerator should be called for each provided file', function() {
         
         var relativeFile1 = '/file1.htm';
         var relativeFile2 = '/file2.htm';
         var file1 = sourceWebRootFolder + relativeFile1;
         var file2 = sourceWebRootFolder + relativeFile2;
         var fileContent1 = 'content of file1';
         var fileContent2 = 'content of file2';
         
         var generatorInteraction1 = {content: fileContent1, url: relativeFile1};
         var generatorInteraction2 = {content: fileContent2, url: relativeFile2};
         
         whenReadingFile(file1).thenReturn(fileContent1);
         whenReadingFile(file2).thenReturn(fileContent2);
         
         filesToGenerate.push(file1);
         filesToGenerate.push(file2);
         
         whenTheGeneratorGenerates(filesToGenerate);
         
         expect(generatorInteractions).to.be.eql([generatorInteraction1, generatorInteraction2]);
      });
      
      it('for each file mkdirWithParents() should be called', function() {
         
         var path1 = '/first/subdirectory';
         var path2 = '/second/folder';
         var file1 = sourceWebRootFolder + path1 + '/abc.htm';
         var file2 = sourceWebRootFolder + path2 + '/123.htm';
         
         filesToGenerate.push(file1);
         filesToGenerate.push(file2);
         
         whenTheGeneratorGenerates(filesToGenerate);
         
         expect(createdTargetFolder).to.be.eql([targetWebRootFolder + path1, targetWebRootFolder + path2]);
      });
      
      it('for each file writeFile() should be called', function() {
         
         var relativeFile1 = '/sale/abc.htm';
         var relativeFile2 = '/123.htm';
         var file1 = sourceWebRootFolder + relativeFile1;
         var file2 = sourceWebRootFolder + relativeFile2;
         var generatorResult1 = 'result 1';
         var generatorResult2 = 'another result 2';
         
         filesToGenerate.push(file1);
         filesToGenerate.push(file2);
         
         whenInvokingGenerateWith(relativeFile1).thenInvokeCallbackWith(null, generatorResult1);
         whenInvokingGenerateWith(relativeFile2).thenInvokeCallbackWith(null, generatorResult2);
         
         whenTheGeneratorGenerates(filesToGenerate);
         
         var writeRequest1 = {path: targetWebRootFolder + relativeFile1, content: generatorResult1};
         var writeRequest2 = {path: targetWebRootFolder + relativeFile2, content: generatorResult2};
         
         expect(writtenFiles).to.be.eql([writeRequest1, writeRequest2]);
      });
      
      it('should throw an error when generate() returns an error', function() {
         
         var relativeFile1 = '/sale/abc.htm';
         var relativeFile2 = '/123.htm';
         var file1 = sourceWebRootFolder + relativeFile1;
         var file2 = sourceWebRootFolder + relativeFile2;
         var generatorResult1 = 'result 1';
         var generatorResult2 = 'another result 2';
         var errorText = 'this is an error';
         var capturedError;
         
         filesToGenerate.push(file1);
         filesToGenerate.push(file2);
         
         whenInvokingGenerateWith(relativeFile1).thenInvokeCallbackWith(null, generatorResult1);
         whenInvokingGenerateWith(relativeFile2).thenInvokeCallbackWith(errorText, undefined);
         
         try {
            whenTheGeneratorGenerates(filesToGenerate);
         } catch (e) {
            capturedError = e;
         }
         expect(capturedError.message).to.be.equal(errorText);
      });

      it('a file, which should get written without modifications, gets written as it is', function() {
         
         var relativeFile1 = '/sale/abc.htm';
         var file1 = sourceWebRootFolder + relativeFile1;
         var fileContent1 = 'content which should get written without modifications';
         
         filesToSendWithoutModifications.push(relativeFile1);
         
         whenReadingFile(file1).thenReturn(fileContent1);
         
         filesToGenerate.push(file1);
         
         whenTheGeneratorGenerates(filesToGenerate);
         
         var writeRequest1 = {path: targetWebRootFolder + relativeFile1, content: fileContent1};
         
         expect(writtenFiles).to.be.eql([writeRequest1]);
      });
   });
   
   describe('getIncludes', function() {

      beforeEach(setup);
      
      it('should return the includes used by the HtmlGenerator', function() {
         
         includesUsedByHtmlGenerator.push('/firstInclude.htm');
         includesUsedByHtmlGenerator.push('/aussaat/second.txt');
         includesUsedByHtmlGenerator.push('/main.css');
         
         whenGetIncludesGetsCalled();
         
         expect(capturedIncludes).to.be.equal(includesUsedByHtmlGenerator);
      });
  });
 });