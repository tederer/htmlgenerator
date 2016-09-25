/* global global, ReduceFunctions */

var PREFIX = 'myPrefix';
var SUFFIX = 'mySuffix';

var previousValues;

var setup = function setup() {
      previousValues = [];
};


var addPreviousValue = function addPreviousValue(value) {
   previousValues.push(value);
};


describe('ReduceFunctions', function() {
	
   describe('unique', function() {

      beforeEach(setup);
      
      it('should add a unique value', function() {
         
         previousValues = ['value1', 'value2'];
         
         var result = ReduceFunctions.unique(previousValues, 'value3');
         
         expect(result).to.be.eql(['value1', 'value2', 'value3']);
      });
	
      it('should not add a duplicate value', function() {
         
         previousValues = ['value1', 'value2'];
         
         var result = ReduceFunctions.unique(previousValues, 'value2');
         
         expect(result).to.be.eql(['value1', 'value2']);
      });
   });

   describe('getRemoveEntriesWithPrefixFunction', function() {

      it('should not remove any entry when none of them starts with the prefix', function() {
         
         var values = ['value1', 'value2'];
         
         var result = values.reduce(ReduceFunctions.getRemoveEntriesWithPrefixFunction(PREFIX), []);
         
         expect(result).to.be.eql(['value1', 'value2']);
      });
      
      it('should remove those elements which are equal prefix', function() {
         
         var values = [PREFIX, PREFIX, 'inputA', PREFIX, 'inputB', PREFIX];
         
         var result = values.reduce(ReduceFunctions.getRemoveEntriesWithPrefixFunction(PREFIX), []);
         
         expect(result).to.be.eql(['inputA', 'inputB']);
      });
      
      it('should remove those elements which start with the prefix', function() {
         
         var values = [PREFIX + 'first', 'inputA', 'inputB', PREFIX + 'second'];
         
         var result = values.reduce(ReduceFunctions.getRemoveEntriesWithPrefixFunction(PREFIX), []);
         
         expect(result).to.be.eql(['inputA', 'inputB']);
      });
      
      it('should not remove those elements which contain the prefix but do not start with it', function() {
         
         var values = ['Cat' + PREFIX + 'first', 'thisIsATest', 'Dog' + PREFIX + 'second'];
         
         var result = values.reduce(ReduceFunctions.getRemoveEntriesWithPrefixFunction(PREFIX), []);
         
         expect(result).to.be.eql(['Cat' + PREFIX + 'first', 'thisIsATest', 'Dog' + PREFIX + 'second']);
      });
      
      it('combined test with different prefix', function() {
         
         var differentPrefix = 'XYZ';
         
         var values = ['Cat' + differentPrefix + 'first', 'thisIsATest', differentPrefix + 'second', 'helloWorld' + differentPrefix, differentPrefix, differentPrefix + '123456_x'];
         
         var result = values.reduce(ReduceFunctions.getRemoveEntriesWithPrefixFunction(differentPrefix), []);
         
         expect(result).to.be.eql(['Cat' + differentPrefix + 'first', 'thisIsATest', 'helloWorld' + differentPrefix]);
      });
   });
   describe('removeHtmlFiles', function() {
      
      it('should not remove any entry when none of them is a HTML file', function() {
         
         var values = ['value1.css', 'value2.js'];

         var result = values.reduce(ReduceFunctions.removeHtmlFiles, []);
         
         expect(result).to.be.eql(['value1.css', 'value2.js']);
      });
      
      it('should remove those elements which end with .htm', function() {
         
         var values = ['fileA.htm', 'fileB', 'fileC.htm'];
         
         var result = values.reduce(ReduceFunctions.removeHtmlFiles, []);
         
         expect(result).to.be.eql(['fileB']);
      });
      
      it('should remove those elements which end with .html', function() {
         
         var values = ['fileA.html', 'fileB', 'fileC.html', 'fileD.txt'];
         
         var result = values.reduce(ReduceFunctions.removeHtmlFiles, []);
         
         expect(result).to.be.eql(['fileB', 'fileD.txt']);
      });
      
      it('should remove those elements which end with .html or htm - ignoreCase', function() {
         
         var values = ['fileA.HTM', 'fileB', 'fileC.hTml', 'fileD.txt', 'fileE.htm', 'fileF.html', 'fileG.HTML', 'last.ini'];
         
         var result = values.reduce(ReduceFunctions.removeHtmlFiles, []);
         
         expect(result).to.be.eql(['fileB', 'fileD.txt', 'last.ini']);
      });
   });
 });