/// Recursive Descent Parser
//https://www.youtube.com/watch?v=SH5F-rwWEog&t=3m12s

(function IIFE ( parser ) {

    var Clock = window.Clock
    var expression = "[var_name]+'7'*10.745"

    console.log( "Expression:", expression )
    Clock.time( "Parse", function () { 
        parser( expression )
    } )
    console.log( result )

})(function parser ( expression ) {

    var exp = expression
    var token = ""
    var L = ""      //current letter
    var i = 0       //index
    result = []

    Main()          //Execute Parser



    ;function Main() {
        next()
        START()
    }

    ;function START() {
        MATH_EXPRESSION()
        
        return
    }

    ;function MATH_EXPRESSION() {  
        TOKEN()
        MATH()
        return
    }

    ;function MATH() {
        if ( isOperatorMath( L ) ) {
            match( isOperatorMath )
            addToken()

            TOKEN()
            MATH()
        } 

        return
    }
    
    ;function TOKEN() {
        if ( isDigit( L ) ) {
            match( isDigit )
            NUMBER()
        } else if ( L === "." ) {
            match( "." )
            RATIONAL()
        } else if ( L === "'" ) {
            match( "'" )
            STRING()
            match( "'" )
        } else if ( L === "[" ) {
            match( "[" )
            VAR()

            if ( L !== "]" ) {
                throwExpectingError( "TOKEN", "lowercase letter [a..z], '_', or ']'", i )
            }
            match( "]" )
        } else {
            throwExpectingError( "TOKEN", "number, string, or variable", i )
        }

        addToken()
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



    ;function addToken() {
        if ( token.trim() !== "" ) {
            result.push( token )
            token = ""
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

    ;function isOperatorMath( letter ) {
        var operatorMath = [ "+", "-", "*", "/", "%" ]
        return operatorMath.includes( letter )
    }

    ;function match( item ) {
        var isCorrect = ( typeof item === "function" && item( L ) )
            || ( Array.isArray( item ) && item.includes( L ) )
            || ( item === L )
        if ( isCorrect ) {
            next()
            return true
        } else {
            throwError( "There was a mismatch", i )
        }
    }

    ;function next() {	
        token += L
        L = exp[ i++ ]
    }



    ;function throwError( message, index ) {        
        var firstPart = "%c" + exp.substring( 0, index - 1 )
        var letter = "%c" + exp.substring( index - 1, index )
        var secondPart = "%c" + exp.substring( index )
        var fontSize = "font-size: 16px;"
        var partCss = "color:grey;" + fontSize
        var letterCss = "color:white;" + fontSize
        console.info( firstPart + letter + secondPart , partCss, letterCss, partCss )

        var error = new Error( message )
        throw error
    }

    ;function throwExpectingError( functionName, expecting, index ) {
        var message = "In function '" 
            + functionName + "', expecting a(n) " 
            + expecting + " at character " 
            + index + ".";
        
        throwError( message, index )
    }

})

