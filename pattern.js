(function (module) {
  'use strict';

  var nested_opening_brace_error_message    = 'Nested opening brace';
  var unmatched_closing_brace_error_message = 'Unmatched closing brace';
  var unclosed_opening_brace_error_message  = 'Unclosed opening brace';

  function _syntax_error( message , at ) {
    throw new SyntaxError(message + ' at ' + at);
  }


  /**
   * @interface
   */
  var Symbol = (function () {
    function Symbol (value) {}
    Symbol.prototype.getValue = function(table) {};
    return Symbol;
  }());

  /**
   * @private
   */
  var Literal = (function () {

    /**
     * @constructor
     * @implements {Symbol}
     */
    function Literal(value) {
      this.value = value;
    }
    /**
     * @override
     */
    Literal.prototype.getValue = function ( /* symbol_table */ ) {
      return this.value;
    };
    return Literal;
  }());

  /**
   * @private
   */
  var Substitution = (function () {

    /**
     * @constructor
     * @implements {Symbol}
     */
    function Substitution(key) {
      this.key = key;
    }
    /**
     * @override
     */
    Substitution.prototype.getValue = function ( symbol_table ) {
      return symbol_table[this.key];
    };
    return Substitution;
  }());


  /**
   * Creates a new Symbol instance
   * @param  {string}  value           the value of the symbol
   * @param  {Boolean} is_substitution true if this Symbol isa Substitution
   * @return {Symbol}                  a new Symbol instance, either a
   *                                   Substitution or a Literal
   */
  function _newSymbol ( value , is_substitution ) {
    if ( is_substitution ) {
      return new Substitution ( value );
    }
    return new Literal ( value );
  }


  var Pattern = (function () {



    /**
     * Converts a string `pattern` into an array of characters that know if
     * they are part of a string literal or part of a substitution identifier.
     *
     * @param  {string} pattern the pattern to be parsed
     * @return {Array.<Object>} a list of character objects of the form
     *                          {"val" : string, "sub" : boolean}
     * @private
     */
    function _convert_to_list ( pattern ) {
      var symbols_list = []
        , symbol_id
        , in_brace
        , length
        , cur
        , i
        ;

      // For each character in the pattern, check to see if it is part of a
      // string literal or a substitution identifier.

      length = pattern.length;

      in_brace = false; // Start with the assumption that we are in a string
                        // literal. If not, the very first character will be
                        // an opening brace.

      symbol_id = 0;    // Each symbol will have it's own ID so we know which
                        // characters belong to which symbol.

      for (i = 0; i < length; i += 1) {
        cur = pattern.charAt(i);

        if ( cur === '{' )
        {

          // This character notes that the start of a substitution identifier
          // is about to begin. We don't want to keep this character in the
          // final string, though, so we won't store it.
          //
          // In a well-formed string, this opening character will not be nested
          // in another substitution identifier.

          if ( in_brace !== false )
            _syntax_error(nested_opening_brace_error_message, i);

          // `in_brace` means that we are now in a substitution identifier.
          in_brace = true;
          symbol_id += 1;

        }
        else if ( cur === '}' )
        {

          // This character notes that the substitution identifier has ended
          // and we should revert to assuming that all characters are string
          // literal characters.
          //
          // In a well-formed string, there are no closing characters without a
          // matching opening character.

          if ( in_brace !== true )
            _syntax_error(unmatched_closing_brace_error_message, i);

          // Setting `in_brace` to false means we are back to characters being
          // part of string literals.
          in_brace = false;
          symbol_id += 1; // If adjacent symbols are Substitutions (like
                          // "{one}{two}"), the symbol ID will increment by two
                          // instead of by one. This doesn't matter because we
                          // don't assume anything about the IDs other than they
                          // are unique per symbol.
        }
        else
        {

          // This character is either part of a string literal or part of the
          // identifier of a substitution. We will store the value in `val`
          // and the substitution property as a boolean `sub`.

          symbols_list.push({
            sid: symbol_id, // current symbol's ID
            val: cur,       // current character's value
            sub: in_brace   // current symbol is a Substitution
          });

        }
      }

      // In a well-formed string, all substitution identifiers will have
      // balanced opening and closing characters.

      if ( in_brace !== false )
        _syntax_error(unclosed_opening_brace_error_message, i);

      return symbols_list;
    }

    /**
     * Returns true if the current character is the end of the current symbol's
     * string.
     *
     * @param  {object}   cur  the current character object
     * @param  {object?} next  the next character object (possibly undefined)
     * @return {boolean}       true if the current character is the end of the
     *                         symbol
     * @private
     */
    function _at_end_of_symbol ( cur , next ) {

      // No next means we're at the end of the string, which means we're
      // at the end of the symbol.
      if ( ! next ) return true;

      // If the next's SID isn't the same as the current symbol ID, then
      // we're at the end of the symbol.
      return next.sid !== cur.sid;
    }

    /**
     * Converts a `pattern` string into an array of Symbol objects.
     * @param  {string} pattern the pattern to be parsed
     * @return {Array.<Symbol>} the symbols in the pattern
     * @private
     */
    function _compile ( pattern ) {
      var char_objects_list  // A list of characters in the pattern.
        , string_accumulator // The current symbol.
        , retarray           // An array of Symbol instances.
        , length             // Number of characters in char_objects_list.
        , next               // The next character.
        , cur                // The current character.
        , i
        ;


      char_objects_list = _convert_to_list ( pattern );
      length = char_objects_list.length;
      retarray = [];


      if ( length === 0 ) {
        // If there are no characters, there are no symbols.
        return retarray;
      }


      // This is the value of the current symbol, either a string
      // literal or a substitution identifier.
      string_accumulator = '';


      for ( i = 0 ; i < length ; i += 1 ) {



        // store the current value in the current symbol

        cur = char_objects_list[i];
        string_accumulator += cur.val;



        // Store and reset the accumulator if we're at the end of the symbol.

        next = char_objects_list[i + 1]; // next can safely be undefined, which
                                         // happens when we're at the end of the
                                         // list.

        if ( _at_end_of_symbol ( cur , next ) ) {
          retarray.push(_newSymbol(string_accumulator, cur.sub));
          string_accumulator = '';
        }


      }

      return retarray;
    }

    /**
     * @constructor
     */
    function Pattern(pattern) {
      if ( this instanceof Pattern ) {
        this.symbols = _compile(pattern);
      } else {
        // Make Pattern safe to call with or without the `new` keyword.
        return new Pattern(pattern);
      }
    }

    /**
     * @expose
     */
    Pattern.prototype.build = function( table ) {
      var length
        , retval
        , i
        ;

      retval = '';
      length = this.symbols.length;

      for ( i = 0; i < length ; i += 1) {
        retval += this.symbols[i].getValue( table );
      }

      return retval;
    };

    return Pattern;

  }());

  module['Pattern'] = Pattern;

}(window));
