/* global global, DocumentPathInserter */

var inserter = new DocumentPathInserter();


var setup = function setup() {
   
};


describe('DocumentPathInserter', function() {
	
   describe('insert(path).into(content)', function() {

      beforeEach(setup);
      
      it('should return the content containing the provided path. - test 1', function() {
         
         var content = '<html><head><title>testpage</title></head>\n\n<body><h1>This is a test</h1></body></html>';
         var path = '';
         var expectedResult = '<html><head><title>testpage</title>   <script>var DOCUMENT_PATH = \'\';</script>\n</head>\n\n<body><h1>This is a test</h1></body></html>';
         
         var result = inserter.insert(path).into(content);
         
         expect(result).to.be.eql(expectedResult);
      });
      
      it('should return the content containing the provided path. - test 2', function() {
         
         var content = '<html><head><title>testpage</title></head>\n\n<body><h1>This is a test</h1></body></html>';
         var path = '/this/is/my/path';
         var expectedResult = '<html><head><title>testpage</title>   <script>var DOCUMENT_PATH = \'' + path + '\';</script>\n</head>\n\n<body><h1>This is a test</h1></body></html>';
         
         var result = inserter.insert(path).into(content);
         
         expect(result).to.be.eql(expectedResult);
      });
   });
 });