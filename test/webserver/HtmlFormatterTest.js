/* global global, HtmlFormatter */

describe('HtmlFormatter', function() {
	
	var replaceCrLfTab = function replaceCrLfTab(text) {
		return text.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
	};

	var scenarios = [
		{	input:			'', 
			expectedResult:	''
		},
		{	input:			'  \t ', 
			expectedResult:	'  \t '
		},
		{	input:			'hallo', 
			expectedResult:	'<p>hallo</p>'
		},
		{	input:			'  \ttest vom Thomas\t ', 
			expectedResult:	'  \t<p>test vom Thomas</p>\t '
		},
		{	input:			'test1\n\n\nbla2\n\nhi3', 
			expectedResult: '<p>test1</p>\n\n\n<p>bla2</p>\n\n<p>hi3</p>'
		},
		{	input:			'  \ttest1\n\n\nbla2\n\nhi3  ', 
			expectedResult: '  \t<p>test1</p>\n\n\n<p>bla2</p>\n\n<p>hi3</p>  '
		},
		{	input:			' test1\nbla2\n\nhi3  ', 
			expectedResult: ' <p>test1\nbla2</p>\n\n<p>hi3</p>  '
		},
		{	input:			' test1\n\tbla2\n\nhi3  ', 
			expectedResult: ' <p>test1\n\tbla2</p>\n\n<p>hi3</p>  '
		},
		{	input:			'test1\n\r\n\nbla2', 
			expectedResult: '<p>test1</p>\n\r\n\n<p>bla2</p>'
		},
		{	input:			'test1\r\nbla2', 
			expectedResult: '<p>test1\r\nbla2</p>'
		},
		{	input:			'test1\nbla2', 
			expectedResult: '<p>test1\nbla2</p>'
		},
		{	input:			'test\n\n<hr>\n\nbla', 
			expectedResult: '<p>test</p>\n\n<hr>\n\n<p>bla</p>'
		},
		{	input:			'test\n\r\n\n<hr>\n\nbla', 
			expectedResult: '<p>test</p>\n\r\n\n<hr>\n\n<p>bla</p>'
		},
		{	input:			'Das ist ein <a href="test.htm">Link</a>.', 
			expectedResult: '<p>Das ist ein <a href="test.htm">Link</a>.</p>'
		},
		{	input:			'Das ist ein\n<a href="test.htm">Link</a>.', 
			expectedResult: '<p>Das ist ein\n<a href="test.htm">Link</a>.</p>'
		},
		{	input:			'<img src="bild.jpg"> Das ist ein Test.\n\nEnde', 
			expectedResult: '<p><img src="bild.jpg"> Das ist ein Test.</p>\n\n<p>Ende</p>'
		},
		{	input:			'<img src="bild.jpg">\n\n<hr>\n\n\nDas ist ein Test.\n\nEnde', 
			expectedResult: '<img src="bild.jpg">\n\n<hr>\n\n\n<p>Das ist ein Test.</p>\n\n<p>Ende</p>'
		},
		{	input:			'<img src="bild.jpg"> Das ist ein Test.\r\nThomas Ederer\n\nEnde', 
			expectedResult: '<p><img src="bild.jpg"> Das ist ein Test.\r\nThomas Ederer</p>\n\n<p>Ende</p>'
		},
		{	input:			'<h1>Hallo und willkommen auf unserer Webseite !</h1>', 
			expectedResult: '<h1>Hallo und willkommen auf unserer Webseite !</h1>'
		},
		{	input:			'\n<h1>Hallo und willkommen auf unserer Webseite !</h1>\n\n', 
			expectedResult: '\n<h1>Hallo und willkommen auf unserer Webseite !</h1>\n\n'
		},
		{	input:			'<h1>Ueberschrift</h1>\n\n<script>\n\n\tvar counter;\n</script> <h1>bla</h1>', 
			expectedResult: '<h1>Ueberschrift</h1>\n\n<script>\n\n\tvar counter;\n</script> <h1>bla</h1>'
		},
		{	input:			'<div id="content">\r\n\r\n<script>\n\n\tvar counter;\n</script> <h1>bla</h1>', 
			expectedResult: '<div id="content">\r\n\r\n<script>\n\n\tvar counter;\n</script> <h1>bla</h1>'
		},
		{	input:			'<div id="content">\r\n\r\n<script>\n\n\tvar counter;\n</script>\nDas ist ein Test!', 
			expectedResult: '<div id="content">\r\n\r\n<script>\n\n\tvar counter;\n</script>\n<p>Das ist ein Test!</p>'
		},
		{	input:         '<h1>Ueberschrift</h1>\n\n<script src="/javascripts/jquery-1.11.3.min.js"></script>\n<script>\n\n\tvar counter;\n\nvar test;\n</script> <h1>bla</h1>', 
			expectedResult: '<h1>Ueberschrift</h1>\n\n<script src="/javascripts/jquery-1.11.3.min.js"></script>\n<script>\n\n\tvar counter;\n\nvar test;\n</script> <h1>bla</h1>'
		},
		{	input:         '<h1>Ueberschrift</h1>\r\n   <script src="/javascripts/jquery-1.11.3.min.js"></script>\n<script>\n\n\tvar counter;\n\nvar test;\n</script> <h1>bla</h1>', 
			expectedResult: '<h1>Ueberschrift</h1>\r\n   <script src="/javascripts/jquery-1.11.3.min.js"></script>\n<script>\n\n\tvar counter;\n\nvar test;\n</script> <h1>bla</h1>'
		}
    ];
    
    scenarios.forEach(function(scenario) {
    
        it('\'' + replaceCrLfTab(scenario.input) + '\'  ->  \'' + replaceCrLfTab(scenario.expectedResult) + '\'', function() {
    
			var htmlFormatter = new HtmlFormatter();
			
			var result = htmlFormatter.insertParagraphs(scenario.input);
			
			expect(result).to.be.equal(scenario.expectedResult);
		});
    });
 });
