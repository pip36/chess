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
    let currentPosition
    currentPosition = load(FENString) || DEFAULT_START_POSITION


//HELPER FUNCTIONS
    function toArrayCoordinates (str) {
        let arr = str.toLowerCase().split('')
		return [8-arr[1],arr[0].charCodeAt(0) - 97]
    }

    function toAlgebraic (arr) {
        let char = String.fromCharCode(97 + arr[1]);
		return (char + (8-arr[0]).toString()).toUpperCase()
    }

    function addVectors (a,b) {
        return [a[0]+b[0], a[1]+b[1]]
    }

    function isOnBoard (coor) {
        return (coor[0] >= 0 && coor[0] < 8 && coor[1] >= 0 && coor[1] < 8)
    }


//FEN FUNCTIONS
// 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    function parseFenRow (result, value) {
        if(isNaN(value)){
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

    function validateFEN (fen) {
        if(fen === undefined) { return false }
        let rows = fen.split(' ')[0].split('/') 
        if(rows.length !== BOARD_SIZE) { 
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

//MOVES FUNCTIONS    
    function calculateDirectMoves (position, moveArray) {
        return moveArray.reduce((moves, move) => {
            let newPosition = addVectors(position, move)
            if(isMoveLegal(newPosition)){ moves.push(newPosition) }  
            return moves
        }, [])
     
    }

    function calculatePathedMoves (position, moveArray) {
        return moveArray.reduce((moves, move) => {
            let pathing = true, newPosition = addVectors(position, move)
            while(pathing){
                isMoveLegal(newPosition) ? moves.push(newPosition) : pathing = false  
                newPosition = addVectors(newPosition, move)
            }    
            return moves
        }, [])
    }

    function isMoveLegal (pos) {
        if(isOnBoard(pos) && getSquare(pos) === null) {
            return true
        }
        return false
    }
    

    

    //MAIN API FUNCTIONS
    // 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    function load (fenString) { 
        if(!validateFEN(fenString)) { return false }
    
        let result = []
        let rows = fenString.split(' ')[0].split('/') 
        rows.forEach(row => {
            let newRow = convertFenRowToArray(row)
            result.push(newRow)
        })
        currentPosition = result
        return result
    }

    function reset () {
        currentPosition = DEFAULT_START_POSITION
    }

    function clear () {
        currentPosition =EMPTY_POSITION 
    }

    function getSquare (square) {
        if(square === undefined) { return null }
        let coordinates = square
        if(!Array.isArray(square)){
            coordinates = toArrayCoordinates(square)
        }
      
        let p = currentPosition[coordinates[0]][coordinates[1]]
        if(p === '-') { return null }
        return Pieces(p, [coordinates[0], coordinates[1]])
    }

    function validMoves (square) {
        var moves = []
        var piece = getSquare(square)
        if(!piece) { return moves }

        if(piece.type === 'p' || piece.type === 'n' || piece.type === 'k'){
            moves = calculateDirectMoves(piece.position, piece.movePattern)
        } else {
            moves = calculatePathedMoves(piece.position, piece.movePattern)
        }

        return moves.map((coordinates) => toAlgebraic(coordinates))
    }

    function place (piece, square) {
        var coor = toArrayCoordinates(square)
        currentPosition[coor[0]][coor[1]] = piece
        return Pieces(piece)
    }

//EXPOSE API FUNCTIONS AS OBJECT
    return {
        position: () => currentPosition,
        load,
        reset,
        clear,
        getSquare,
        place,
        validMoves
    }    
}

module.exports = Chess
