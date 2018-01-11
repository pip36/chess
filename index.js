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
                isMoveLegal(newPosition) ? moves.push(newPosition) : pathing = false  
                newPosition = addVectors(newPosition, move)
            }    
            return moves
        }, [])
    }

    function isMoveLegal (pos) {
        if (isOnBoard(pos) && getSquare(pos) === null) {
            return true
        }
        return false
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
        if(!piece) return [] 

        let moves = []
        moves = piece.pathable ? pathedMoves(piece.position, piece.movePattern) : 
                                 directMoves(piece.position, piece.movePattern)
       
        return moves.map((coordinates) => toAlgebraic(coordinates))
    }

    function place (piece, square) {
        let coor = toArrayCoordinates(square)
        currentBoard[coor[0]][coor[1]] = piece
        return Pieces(piece)
    }

//EXPOSE API FUNCTIONS AS OBJECT
    return {
        position: () => currentBoard,
        load,
        reset,
        clear,
        getSquare,
        place,
        validMoves
    }    
}

module.exports = Chess
