var SCRIPT_START_TAG='<script';
var SCRIPT_END_TAG='</script>';

var EOF = null;
var state;
var rawText='';
var result = '';
var content;
var whiteSpaces = '';
var currentIndex;
var scriptCharacters;
var scriptEndTagIndex;
   
// states declaration
var oneLineFeedAfterContent;
var captureContent;
var scriptContent;
var initialState;


var Type = {

   CR : 'CR',
   LF : 'LF',
   TAB : 'TAB',
   LESS_THAN : 'LESS_THAN',
   GREATER_THAN : 'GREATER_THAN',
   WHITESPACE : 'WHITESPACE',
   EOF : 'EOF',
   UNKNOWN : 'UNKNOWN',
   SPACE : 'SPACE'
};

   
var identifyCharacter = function identifyCharacter(c) {
   
   if (c === EOF) {
      return Type.EOF;
   }
   
   if (c === '\r') {
      return Type.CR;
   }
   
   if (c === '\n') {
      return Type.LF;
   }
   
   if (c === '\t') {
      return Type.TAB;
   }
   
   if (c === ' ') {
      return Type.SPACE;
   }
   
   if (c === '<') {
      return Type.LESS_THAN;
   }
   
   if (c === '>') {
      return Type.GREATER_THAN;
   }
   
   return Type.UNKNOWN;
};


var nextCharactersAre = function nextCharactersAre(nextCharacters) {

   var returnValue = false;

   if (nextCharacters.length > 0) {

     var subText = rawText.substr(currentIndex + 1, nextCharacters.length);
     returnValue = nextCharacters === subText;
   }

   return returnValue;
};


var putTextInParagraphs = function putTextInParagraphs(text) {
  var length = text.length;
  return (length > 2 && (text.charAt(0) !== '<' || text.charAt(length - 1) !== '>')) ? '<p>' + text + '</p>' : text;
};
 
 
var createInput = function createInput(character, type) {

   return { character : character, type : type };
};


var createState = function createState(stateName, nextCharacterFunction) {

   return { processCharacter : nextCharacterFunction, name : stateName };
};


var oneLineFeedAfterContent = createState('oneLfAfterContent', function(c) {
   
   switch (c.type) {
   
      case Type.SPACE:
      case Type.CR:
      case Type.TAB:       whiteSpaces += c.character;
                           break;
                                 
      case Type.LF:        result += putTextInParagraphs(content) + whiteSpaces + c.character;
                           whiteSpaces = '';
                           state = initialState;
                           break;
      
      case Type.EOF:       result += putTextInParagraphs(content) + whiteSpaces;
                           break;
                                 
      case Type.LESS_THAN: if (nextCharactersAre(SCRIPT_START_TAG.substr(1))) {
                           
                              result += putTextInParagraphs(content) + whiteSpaces;
                              whiteSpaces = '';
                              scriptCharacters = c.character;
                              state = scriptContent;
                              
                           } else {
                              
                              content += whiteSpaces + c.character;
                              whiteSpaces = '';
                              state = captureContent;
                              
                           }
                           break;
      
      default:             content += whiteSpaces + c.character;
                           whiteSpaces = '';
                           state = captureContent;
                           break;
   }
});


var captureContent = createState('captureContent', function(c) {
   
   switch (c.type) {
   
      case Type.SPACE:
      case Type.CR:
      case Type.TAB:       whiteSpaces += c.character;
                           break;
                                 
      case Type.LF:        whiteSpaces += c.character;
                           state = oneLineFeedAfterContent;
                           break;
      
      case Type.EOF:       result += putTextInParagraphs(content) + whiteSpaces;
                           break;
                                 
      default:             content += whiteSpaces + c.character;
                           whiteSpaces = '';
                           break;
   }
});


var scriptContent = createState('scriptContent', function(c) {
   
   switch (c.type) {
   
      case Type.EOF:    result += scriptCharacters;
                        break;
                                 
      default:          if ( scriptCharacters.length < SCRIPT_START_TAG.length) {
      
                           if (c.character === SCRIPT_START_TAG.charAt(scriptCharacters.length)) {
         
                              scriptCharacters += c.character;
                              scriptEndTagIndex = 0;
                           
                           } else {
                           
                              content = scriptCharacters + c.character;
                              state = captureContent;
                           }
                           
                        } else { // SCRIPT_START_TAG already detected -> waiting for SCRIPT_END_TAG
                        
                           scriptCharacters += c.character;
                           
                           scriptEndTagIndex = (c.character === SCRIPT_END_TAG.charAt(scriptEndTagIndex)) ? scriptEndTagIndex + 1 : 0;
                           
                           if (scriptEndTagIndex === SCRIPT_END_TAG.length) {
                           
                              result += scriptCharacters;
                              state = initialState;
                           }
                        }
                        break;
   }
});


var initialState = createState('initialState', function(c) {   
   
   switch (c.type) {
   
      case Type.SPACE:
      case Type.CR:
      case Type.LF:
      case Type.TAB:       whiteSpaces += c.character;
                           break;
      
      case Type.EOF:       result += whiteSpaces;
                           break;
      
      case Type.LESS_THAN: result += whiteSpaces;
                           whiteSpaces = '';
                           scriptCharacters = c.character;
                           state = scriptContent;
                           break;
      
      default:             result += whiteSpaces;
                           whiteSpaces = '';
                           content = c.character;
                           state = captureContent;
                           break;
   }
});

   
var Constructor = function Constructor() {

   this.insertParagraphs = function insertParagraphs(text) {
   
      rawText = text;
      state = initialState;
      result = '';
      whiteSpaces = '';

      currentIndex = 0;

      while (currentIndex < text.length) {
        
         var character = text.charAt(currentIndex);
         var type = identifyCharacter(character);
         
         state.processCharacter(createInput(character, type));
         
         currentIndex++;
      }
      
      state.processCharacter(createInput('', Type.EOF));
      
      return result;
   };
};


module.exports = Constructor;