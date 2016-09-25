/**
 * Makes the path available to javascripts by setting the variable DOCUMENT_PATH.
 */

var getContentWithInserteddocumentPath = function getContentWithInserteddocumentPath(content, documentPath) {

   var result = content;
   var insertationPosition = content.indexOf('</head>');

   if (insertationPosition > -1) {
   
      var prefix = content.substr(0,insertationPosition);
      var suffix = content.substr(insertationPosition);
      result = prefix + '   <script>var DOCUMENT_PATH = \'' + documentPath + '\';</script>\n' + suffix;
   }
   
   return result;
};


var Constructor = function Constructor() {
   
   this.insert = function insert(documentPath) {
      return {
         into: function into(content) {
            return getContentWithInserteddocumentPath(content, documentPath);
         }
      };
   };
};

module.exports = Constructor;

