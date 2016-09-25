/* global global, Logger, before, after */

var originalLogfilename;
var timestamp;
var capturedConsoleOutput;
var capturedFileOutput;
var capturedFileName;

var fileSystem = {
   appendToFile: function appendToFile(absolutePathOfFile, content) {
      capturedFileName = absolutePathOfFile;
      capturedFileOutput = content;
   }
};

var timeSource = {

      getformattedDate: function getformattedDate() {
         return timestamp;
      }
};

var writeToConsole = function writeToConsole(text) {
   capturedConsoleOutput = text;
};

var optionals = {
   alternativeFileSystem: fileSystem,
   alternativeTimeSource: timeSource,
   alternativeWriteToConsole: writeToConsole
};

var setup = function setup() {
   global.LOGFILENAME = 'D:\var\test.log';
   Logger.enableConsoleOutput(true);
   timestamp = undefined;
   capturedConsoleOutput = undefined;
   capturedFileOutput = undefined;
   capturedFileName = undefined;
};

     
describe('Logger', function() {
	
   before(function() { 
      originalLogfilename = global.LOGFILENAME;
   });
   
   after(function() {
    global.LOGFILENAME = originalLogfilename;
   });
   
   describe('info', function() {

      beforeEach(setup);
      
      it('writes to the console', function() {
         
         timestamp = '29.03.16 12:37:01';
         var text = 'Das ist ein Test!';
         var classname = 'myClass';
         
         var LOG = Logger.getLoggerFor(classname, optionals);
         
         LOG.info(text);
         
         expect(capturedConsoleOutput).to.be.eql('\t' + text);
      });
      
      it('does not write to the console when setNoConsoleOutput(true)', function() {
         
         timestamp = '29.03.16 12:37:01';
         var text = 'Das ist ein Test!';
         var classname = 'noInfoWhenNoConsoleOutputIsTrue';
         
         Logger.enableConsoleOutput(false);
         var LOG = Logger.getLoggerFor(classname, optionals);
         
         LOG.info(text);
         
         expect(capturedConsoleOutput).to.be.eql(undefined);
      });
      
      it('appends to the logfile', function() {
         
         timestamp = '17.12.05 09:42:11';
         var text = 'Das ist ein Test 2 !';
         var classname = 'SpecialClass';
         
         var LOG = Logger.getLoggerFor(classname, optionals);
         
         LOG.info(text);
         
         expect(capturedFileName).to.be.eql(global.LOGFILENAME);
         expect(capturedFileOutput).to.be.eql(timestamp + ';INFO;' + classname + ';' + text + '\r\n');
      });
      
      it('throws an error when the name of the logfile is undefined.', function() {
         
         global.LOGFILENAME = undefined;
         var classname = 'errorTest';
         var capturedError;
         
         var LOG = Logger.getLoggerFor(classname, optionals);
         
         try {
            LOG.info('something');
         } catch (e) {
            capturedError = e;
         }
         expect(capturedError).to.not.be.eql(undefined);
      });
   });
	
   describe('debug', function() {

      beforeEach(setup);
      
      it('appends to the logfile', function() {
         
         timestamp = '22.09.12 23:59:01';
         var text = 'Geht das ?';
         var classname = 'TestClass';
         
         var LOG = Logger.getLoggerFor(classname, optionals);
         
         LOG.debug(text);
         
         expect(capturedFileName).to.be.eql(global.LOGFILENAME);
         expect(capturedFileOutput).to.be.eql(timestamp + ';DEBUG;' + classname + ';' + text + '\r\n');
      });
      
      it('throws an error when the name of the logfile is undefined.', function() {
         
         global.LOGFILENAME = undefined;
         var classname = 'errorTest for debug';
         var capturedError;
         
         var LOG = Logger.getLoggerFor(classname, optionals);
         
         try {
            LOG.debug('something else');
         } catch (e) {
            capturedError = e;
         }
         expect(capturedError).to.not.be.eql(undefined);
      });
   });
   
   describe('error', function() {

      beforeEach(setup);
      
      it('appends to the logfile', function() {
         
         timestamp = '22.09.12 23:59:01';
         var text = 'Geht das ?';
         var classname = 'TestClass';
         
         var LOG = Logger.getLoggerFor(classname, optionals);
         
         LOG.error(text);
         
         expect(capturedFileName).to.be.eql(global.LOGFILENAME);
         expect(capturedFileOutput).to.be.eql(timestamp + ';ERROR;' + classname + ';' + text + '\r\n');
      });
   });
 });