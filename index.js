"use strict";
var Pieces = require('./pieces')

var Chess = function (FENString) {

//CONSTANTS
    const BOARD_SIZE = 8
    const DEFAULT_START_POSITION = [
        ['r','n','b','q','k','b','n','r'],
        ['p','p','p','p','p','p','p','p'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['P','P','P','P','P','P','P','P'],
        ['R','N','B','Q','K','B','N','R']
    ]
    const EMPTY_POSITION = [
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-']
    ]

//TRACKED VARIABLES
    let currentBoard
    currentBoard = load(FENString) || DEFAULT_START_POSITION
    let currentPlayer = 'white'

//HELPER FUNCTIONS
    function toArrayCoordinates (str) {
        let arr = str.toLowerCase().split('')
		return [8-arr[1],arr[0].charCodeAt(0) - 97]
    }

    function toAlgebraic (arr) {
        let char = String.fromCharCode(97 + arr[1])
		return (char + (8-arr[0]).toString()).toUpperCase()
    }

    function addVectors (a,b) {
        return [a[0]+b[0], a[1]+b[1]]
    }

    function isOnBoard (coor) {
        return (coor[0] >= 0 && coor[0] < 8 && coor[1] >= 0 && coor[1] < 8)
    }


//*FEN FUNCTIONS
// 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    function parseFenRow (result, value) {
        if (isNaN(value)) {
            result.push(value)
            return result
        } 
        else {
            for(let n = 0; n < value; n++){
                result.push('-')
            }
            return result
        }
    }

    function convertFenRowToArray (row) {
        return row.split('').reduce(parseFenRow, [])
    }

    function isValidFEN (fen) {
        if (fen === undefined) return false 
        let rows = fen.split(' ')[0].split('/') 
        if (rows.length !== BOARD_SIZE) { 
            throw new Error('Fen string has wrong number of rows.') 
        }
        rows.forEach(row => {
            let newRow = convertFenRowToArray(row)
            if(newRow.length !== BOARD_SIZE) {
                throw new Error('Fen string has a row with wrong number of pieces.') 
            }
        })
        return true
    }

//*MOVES FUNCTIONS    
    function directMoves (position, moveArray) {
        return moveArray.reduce((moves, move) => {
            let newPosition = addVectors(position, move)
            if (isMoveLegal(newPosition))  moves.push(newPosition)   
            return moves
        }, [])
    }

    function pathedMoves (position, moveArray) {
        return moveArray.reduce((moves, move) => {
            let pathing = true, newPosition = addVectors(position, move)
            while (pathing) {
                if (isMoveLegal(newPosition)) {
                    moves.push(newPosition)
                    if (isEnemyPiece(getSquare(newPosition))) { pathing = false } 
                } else {
                    pathing = false
                }
                
                
                newPosition = addVectors(newPosition, move)
            }    
            return moves
        }, [])
    }

    function pawnMoves (pawn) {
        let moves = []
        //normal moves
        if (pawn.doubleMoveAllowed) {
            for (var i = 0; i < pawn.movePattern.length; i++) {
                let newPosition = addVectors(pawn.position, pawn.movePattern[i])
                if (getSquare(newPosition)) { break }
                else {
                    if(isMoveLegal(newPosition)) moves.push(newPosition)
                }
            }
        } else {
            let newPosition = addVectors(pawn.position, pawn.movePattern[0])
            if (!getSquare(newPosition)) {
                if(isMoveLegal(newPosition)) moves.push(newPosition)
            }
        }
        //look for captures
        for(var i = 0; i < pawn.captures.length; i++) {
            let newPosition = addVectors(pawn.position, pawn.captures[i])
           
            if(isMoveLegal(newPosition)) {
                let piece = getSquare(newPosition)           
                if (piece && isEnemyPiece(piece)) {
                    moves.push(newPosition)
                }
            }       
        }

        return moves
    }

    function isMoveLegal (pos) {
        if (!isOnBoard(pos)) return false

        let piece = getSquare(pos)
        
        if (piece && piece.color === currentPlayer) {
            return false
        }
        return true
    }

    function isEnemyPiece(piece) {
        return (piece && piece.color !== currentPlayer)      
    }

    function getAttackers(square) {
        let checks = []
        square = toArrayCoordinates(square)

        //knights + king
        let knightKingMoves = Pieces('n', square).movePattern.concat(Pieces('k', square).movePattern)
        let possibleKnightKingChecks = directMoves(square, knightKingMoves)

        possibleKnightKingChecks.forEach(square => {
            let piece = getSquare(square)
            if (piece && (piece.type === 'n' || piece.type === 'k') && isEnemyPiece(piece)) {
                checks.push(square)
            }
        })

        // pathable pieces (bishop queen rook)
        let queenMoves = Pieces('q', square).movePattern
        let possibleQueenChecks = pathedMoves(square, queenMoves)

        possibleQueenChecks.forEach(square => {
            let piece = getSquare(square)
            if (piece && piece.pathable && isEnemyPiece(piece)) {
                checks.push(square)
            }
        })

        //pawns
        let pawnAttacks 
        currentPlayer === 'white' ? pawnAttacks = Pieces('P', square).captures :
                                    pawnAttacks = Pieces('p', square).captures
            
        for(var i = 0; i < pawnAttacks.length; i++) {
            let newPosition = addVectors(square, pawnAttacks[i])
            if(isMoveLegal(newPosition)) {
                let piece = getSquare(newPosition)
                if (piece && isEnemyPiece(piece) && piece.type === 'p') {
                    checks.push(newPosition)
                }
            }          
        }

        if (checks.length === 0) return null
        return checks.map((coor) => toAlgebraic(coor))
    }
    

    

    //*API FUNCTIONS
    // 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    function load (fenString) { 
        if (!isValidFEN(fenString)) return false
        let result = []
        let rows = fenString.split(' ')[0].split('/') 

        rows.forEach(row => result.push(convertFenRowToArray(row)))

        currentBoard = result
        return result
    }

    function reset () {
        currentBoard = DEFAULT_START_POSITION
    }

    function clear () {
        currentBoard = EMPTY_POSITION 
    }

    function getSquare (square) {
        if (square === undefined) return null 
        let coor
        Array.isArray(square) ? coor = square : coor = toArrayCoordinates(square)    
        let pieceType = currentBoard[coor[0]][coor[1]]
        return pieceType === '-' ? null : Pieces(pieceType, [coor[0], coor[1]])
    }

    function validMoves (square) {
        let piece = getSquare(square)
        if(!piece || isEnemyPiece(piece)) return [] 

        let moves = []
        if (piece.type === 'p') {
            moves = pawnMoves(piece)
        } else {
            moves = piece.pathable ? pathedMoves(piece.position, piece.movePattern) : 
            directMoves(piece.position, piece.movePattern)
        }
       
       
        return moves.map((coordinates) => toAlgebraic(coordinates))
    }

    function place (piece, square) {
        let coor = toArrayCoordinates(square)
        currentBoard[coor[0]][coor[1]] = piece
        return Pieces(piece, [coor[0],coor[1]])
    }

    function setPlayer (color) {   
        if (color === 'white' || color === 'black') { 
            currentPlayer = color
        } else {
            throw new Error('Color must be black or white.') 
        }   
    }

    function find (pieceType, color) {
        return currentBoard.reduce((squares, row, j) => {
            for (var i = 0; i < row.length; i++) {
                let square = [j,i]
                let piece = getSquare(square)
                if (piece && piece.type === pieceType && piece.color === color) {
                    squares.push(toAlgebraic(square))
                }
            }
            return squares
        }, [])
    }

    function inCheck() {
        return getAttackers(find('k', currentPlayer)[0])
    }

//EXPOSE API FUNCTIONS AS OBJECT        //(fen) => sets initial position
    return {
        position: () => currentBoard,  // => returns array of characters
        player: () => currentPlayer,  // => returns white/black
        setPlayer,                   // (color) => sets player to white/black
        load,                       // (fen) => loads in a new fen board
        reset,                     // => set board to the start position
        clear,                    // => remove all pieces from board
        getSquare,               //('E4') => returns piece object from the given square
        place,                  // (piece, square) => changes piece on a given square
        validMoves,            // ('A1') => returns the valid moves for piece on given square
        find,                 // (type, color) => finds locations of all pieces of matching type and color
        inCheck              //  => returns null if no checks are found, otherwise returns the squares that are giving check
    }    
}



module.exports = Chess
