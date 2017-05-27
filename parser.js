/// Recursive Descent Parser
//https://www.youtube.com/watch?v=SH5F-rwWEog&t=3m12s

(function IIFE ( parser ) {

    var Clock = window.Clock
    var expression = "[var] + 3"

    var result
    Clock.time( "Parse", function () { 
        result = parser( expression )
    } )

    console.log( "Expression:", expression )
    console.log( result )

})(function parser ( expression ) {

    var exp = expression
    var token = ""
    var L = ""      //current letter
    var i = 0       //index
    var stack = []



    return (function Main() {
        appendAndNext()
        START()
        return POP()
    })()



    ///Parser
    ;function START() {
        CONDITION_EXPRESSION()
        LOGIC()
        return
    }

    ;function LOGIC() {
        ignoreWhitespaces()
        
        if ( isOperatorLogicStart( L ) ) {
            OPERATOR_LOGIC()
            PUSH()

            CONDITION_EXPRESSION()
            LOGIC()

            LOGIC_ONE_SEMANTIC()
        }

        return
    }

    ;function CONDITION_EXPRESSION() {
        MATH_EXPRESSION()
        CONDITION()
        return
    }

    ;function CONDITION() {
        ignoreWhitespaces()
        
        if ( isOperatorConditionStart( L ) ) {
            OPERATOR_CONDITION()
            PUSH()

            MATH_EXPRESSION()
            CONDITION()

            CONDITION_ONE_SEMANTIC()
        }

        return
    }

    ;function MATH_EXPRESSION() {  
        PARENTHESIS_EXPRESSION()
        MATH()
        return
    }

    ;function MATH() {
        ignoreWhitespaces()

        if ( isOperatorMath( L ) ) {
            match( isOperatorMath )
            PUSH()

            PARENTHESIS_EXPRESSION()
            MATH()

            MATH_ONE_SEMANTIC()
        } 

        return
    }

    ;function PARENTHESIS_EXPRESSION() {
        ignoreWhitespaces()

        if ( L === "(" ) {
            skip( "(" )
            START()

            if ( L === ")" ) {
                skip( ")" )
            } else {
                throwExpectingError( "PARENTHESIS_EXPRESSION", "')'", i )
            }

        } else {
            TOKEN()
        }

        return
    }
    
    ;function TOKEN() {
        ignoreWhitespaces()

        var node;
        if ( isDigit( L ) ) {
            match( isDigit )
            NUMBER()

            node = LiteralNode( token, typeof 0 )
            PUSH(node)
        } else if ( L === "." ) {
            match( "." )
            RATIONAL()

            node = LiteralNode( token, typeof 0 )
            PUSH(node)
        } else if ( L === "'" ) {
            skip( "'" )
            STRING()
            skip( "'" )

            node = LiteralNode( token.trim(), typeof "" )
            PUSH(node)
        } else if ( L === "t" || L === "f" ) {
            BOOL()

            node = LiteralNode( token, typeof true )
            PUSH(node)
        } else if ( L === "[" ) {
            skip( "[" )
            VAR()

            if ( L !== "]" ) {
                throwExpectingError( "TOKEN", "lowercase letter [a..z], '_', or ']'", i )
            }
            skip( "]" )

            node = IdentifierNode( token )
            PUSH(node)
        } else {
            throwExpectingError( "TOKEN", "number, string, or variable", i )
        }

        return
    }

    ;function BOOL() {
        if ( L === "t" ) {
            match( "t" )
            match( "r" )
            match( "u" )
            match( "e" )
        } else if ( L === "f" ) {
            match( "f" )
            match( "a" )
            match( "l" )
            match( "s" )
            match( "e" )
        } else {
            throwExpectingError( "BOOL", "true or false", i )
        }

        return
    }

    ;function NUMBER() {
        if ( isDigit( L ) ) {
            match( isDigit )
            NUMBER()
        } else if ( L === "." ) {
            match( "." )
            RATIONAL()
        }

        return
    }

    ;function RATIONAL() {
        if ( isDigit(L) ) {
            match( isDigit )
            RATIONAL()
        }

        return
    }

    ;function STRING() {
        if ( L === "'" ) {
            //Add later?
            /*
            match( "'" )
            
            if ( L === "'" ) {
                match( "'" )
                STRING()
            }
            */
        } else {
            match( L )
            STRING()
        }

        return
    }

    ;function VAR() {
        if ( isLowerCaseLetter( L ) ) {
            match( isLowerCaseLetter )
            VAR_NAME()
        } else {
            throwExpectingError( "VAR", "lowercase letter [a..z]", i )
        }

        return
    }

    ;function VAR_NAME() {
        if ( isLowerCaseLetter( L ) ) {
            match( isLowerCaseLetter )
            VAR_NAME()
        } else if ( L === "_" ) {
            match( "_" )
            VAR_NAME()
        } 

        return
    }

    ;function OPERATOR_LOGIC() {
        if ( L === "a" ) {
            match( "a" )
            match( "n" )
            match( "d" )
        } else if ( L === "o" ) {
            match( "o" )
            match( "r" )
        } else {
            throwExpectingError( "OPERATOR_LOGIC", "'and' or 'or'", i )
        }

        return
    }

    ;function OPERATOR_CONDITION() {
        if ( L === "=" ) {
            match( "=" )

            if ( L === "=" ) {
                match( "=" )
            } else {
                throwExpectingError( "OPERATOR_CONDITION", "'='", i )
            }
        } else if ( L === "!" ) {
            match( "!" )

            if ( L === "=" ) {
                match( "=" )
            } else {
                throwExpectingError( "OPERATOR_CONDITION", "'='", i )
            }
        } else if ( L === "<" ) {
            match( "<" )
            
            if ( L === "=" ) {
                match( "=" )
            }
        } else if ( L === ">" ) {
            match( ">" )

            if ( L === "=" ) {
                match( "=" )
            }
        } else {
            throwExpectingError( "OPERATOR_CONDITION", "'=', '!', '<', or '>'", i )
        }

        return
    }

    ///Semantics
    ;function PUSH( item ) {
        if ( typeof item === "object" ) {
            stack.push( item )
        } else if ( token.trim() !== "" ) {
            stack.push( token )
        }
        
        token = ""
    }

    ;function POP() {
        return stack.pop()
    }

    ;function LOGIC_ONE_SEMANTIC() {
        var right = POP()
        var operator = POP()
        var left = POP()
        var node = LogicalExpression( operator, left, right )
        PUSH( node )
    }

    ;function CONDITION_ONE_SEMANTIC() {
        var right = POP()
        var operator = POP()
        var left = POP()
        var node = BinaryExpression( operator, left, right )
        PUSH( node )
    }

    ;function MATH_ONE_SEMANTIC() {
        var right = POP()
        var operator = POP()
        var left = POP()
        var node = BinaryExpression( operator, left, right )
        PUSH( node )
    }

    //Nodes
    ;function LiteralNode( value, valueType ) {
        return {
            type: "Literal",
            value: parseType( value, valueType ),
            valueType: valueType,
        }
    }

    ;function IdentifierNode( name ) {
        return {
            type: "Identifier",
            name: name,
            valueType: undefined,
        }
    }

    ;function BinaryExpression( operator, left, right ) {
        return {
            type: "BinaryExpression",
            operator: operator,
            left: left,
            right: right,
        }
    }

    ;function LogicalExpression( operator, left, right ) {
        return {
            type: "LogicalExpression",
            operator: operator,
            left: left,
            right: right,
        }
    }



    ///Helpers
    ;function ignoreWhitespaces() {
        while( L === " " ) {
            next()
        }
    }

    ;function isDigit( letter ) {
        var number
        if ( typeof letter === "string" ) {
            number = parseInt( letter )
        } else if ( typeof letter === "number" ) {
            number = letter
        }

        return isNaN( number ) === false 
            && typeof number === "number"
    }

    ;function isLowerCaseLetter( letter ) {
        //TODO: Refactor - Use character codes.
        var lowerCaseLetters = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z" ]
        return lowerCaseLetters.includes( letter )
    }

    ;function isOperatorConditionStart( letter ) {
        var operatorConditionStart = [ "=", "!", "<", ">" ]
        return operatorConditionStart.includes( letter )
    }

    ;function isOperatorLogicStart( letter ) {
        var operatorLogicStart = [ "a", "o" ]
        return operatorLogicStart.includes( letter )
    }

    ;function isOperatorMath( letter ) {
        var operatorMath = [ "+", "-", "*", "/", "%" ]
        return operatorMath.includes( letter )
    }

    ;function match( item ) {
        var isCorrect = ( typeof item === "function" && item( L ) )
            || ( Array.isArray( item ) && item.includes( L ) )
            || ( item === L )
        if ( isCorrect ) {
            appendAndNext()
        } else {
            throwError( "There was a mismatch", i )
        }
    }
    ;function skip( item ) {        
        var isCorrect = ( typeof item === "function" && item( L ) )
            || ( Array.isArray( item ) && item.includes( L ) )
            || ( item === L )
        if ( isCorrect ) {
            next()
        } else {
            throwError( "There was a mismatch", i )
        }
    }

    ;function next() {	
        L = exp[ i++ ]
    }
    ;function appendAndNext() {
        token += L
        next()
    }

    ;function parseType( value, valueType ) {
        switch ( valueType ) {
            case typeof "":
                return value.toString()
            case typeof 0:
                return parseFloat( value )
            case typeof true:
                return value === "true" || value === true
            default:
                return ""
        }
    }

    ///ERROR Handling
    ;function throwError( message, index ) {        
        var firstPart = "%c" + exp.substring( 0, index - 1 )
        var letter = exp.substring( index - 1, index)
        letter = "%c" + (letter == null || letter.trim() === "" ? "_" : letter) //highlight whitespace with underscore
        var secondPart = "%c" + exp.substring( index )
        var fontSize = "font-size: 16px;"
        var partCss = "color:grey;" + fontSize
        var letterCss = "color:white;" + fontSize //dark scheme
        //var letterCss = "color:black;" + fontSize //light scheme
        console.info( firstPart + letter + secondPart , partCss, letterCss, partCss )

        var indexMessage = index >= exp.length
            ? " at the last character."
            : " at character " + index + "."
        message += indexMessage
        var error = new Error( message )
        throw error
    }

    ;function throwExpectingError( functionName, expecting, index ) {
        var message = "In function '" 
            + functionName + "', expecting a(n) "
            + expecting
        
        throwError( message, index )
    }

})

