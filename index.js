"use strict";
var Pieces = require('./pieces')

var Chess = function (FENString) {

//CONSTANTS
    const BOARD_SIZE = 8

//TRACKED VARIABLES
    let currentBoard
    currentBoard = load(FENString) || load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    let currentPlayer = 'white'
    let castling = {
        K: true,
        Q: true,
        k: true,
        q: true
    }

//HELPER FUNCTIONS
    function errorMessage (msg) {
        throw new Error(msg)
    }

    function toArrayCoordinates (str) {
        if (typeof str !== 'string') errorMessage('toArrayCoordinates expects a string') 
        let arr = str.toLowerCase().split('')
		return [8-arr[1],arr[0].charCodeAt(0) - 97]
    }

    function toAlgebraic (arr) {
        if (!Array.isArray(arr)) errorMessage('toAlgebraic expects an array')
        let char = String.fromCharCode(97 + arr[1])
		return (char + (8-arr[0]).toString()).toUpperCase()
    }

    function addVectors (a,b) {
        if (!Array.isArray(a) || !Array.isArray(b)) errorMessage('addVectors expects 2 arrays')
        return [a[0]+b[0], a[1]+b[1]]
    }

    function isOnBoard (coor) {
        if (!Array.isArray(coor)) errorMessage('isOnBoard expects an array')
        return (coor[0] >= 0 && coor[0] < 8 && coor[1] >= 0 && coor[1] < 8)
    }

    function getSquare (square, board = currentBoard) {
        if (!Array.isArray(square)) square = toArrayCoordinates(square)  
        if (isOnBoard(square)) return board[square[0]][square[1]]
        errorMessage('Invalid getSquare value')
    }

    function isWhite (val) {
        if (val === '-') return false
        return val === val.toUpperCase()
    }

    function isBlack (val) {
        if (val === '-') return false
        return val === val.toLowerCase()
    }

    function isEmpty(val) {
        return val === '-'
    }

    function isFriendlyPiece(val) {
        if (isEmpty(val)) return false
        return ((isWhite(val) && currentPlayer === 'white') || 
                (isBlack(val) && currentPlayer === 'black'))
    }

    function isEnemyPiece(val) {
        if(isEmpty(val)) return false
        return ((isWhite(val) && currentPlayer === 'black') || 
                (isBlack(val) && currentPlayer === 'white')) 
    }

    function isCastlingLegal (rookSquare, clearSquares) {
        if (getSquare(rookSquare).toLowerCase() !== 'r' || inCheck()) return false
        for(let i = 0; i < clearSquares.length; i++){
            if (!isEmpty(getSquare(clearSquares[i])) || 
                getAttackers(clearSquares[i]) !== null ) return false
        }                 
        return true
    }

    function kingTrapped () {
        let kingPosition = findKing()
        return validMoves(kingPosition).length === 0
    }

//FEN FUNCTIONS
    function convertFenRowToArray (row) {
        return row.split('').reduce(parseFenRow, [])
    }

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

    function isValidFEN (fen) {
        if (fen === undefined) return false 
        let rows = fen.split(' ')[0].split('/') 
        if (rows.length !== BOARD_SIZE) errorMessage('Fen string has wrong number of rows.')     
        rows.forEach(row => {
            let newRow = convertFenRowToArray(row)
            if (newRow.length !== BOARD_SIZE) errorMessage('Fen string has a row with wrong number of pieces.')
        })
        return true
    }

//MOVES FUNCTIONS 
    // returns list of coordinates that are on the board
    function getPossibleMoves (positionArr, movesArr) {
        return movesArr.reduce((possibleMoves, move) => {
            let newPosition = addVectors(positionArr, move)
            if (isOnBoard(newPosition)) possibleMoves.push(newPosition)
            return possibleMoves
        }, [])
    }

    // returns list of moves for pieces that allow pathing
    function getPossibleMovesPathed (positionArr, movesArr, board = currentBoard) {
        return movesArr.reduce((possibleMoves, move) => {
            let pathing = true, newPosition = addVectors(positionArr, move)
            while(pathing) {            
                if(isOnBoard(newPosition)) {
                    let cell = getSquare(newPosition, board)
                    if(!isEmpty(cell)) {
                        possibleMoves.push(newPosition)
                        pathing = false
                    } 
                    else possibleMoves.push(newPosition)     
                } 
                else pathing = false
                newPosition = addVectors(newPosition, move)            
            }        
            return possibleMoves
        }, [])
    }

    // redo if poss. handles pawn move case (separate captures/moves?) (doing too many things)
    function pawnMoves (pawn) {
        let moves = []
        //normal moves
        if (pawn.doubleMoveAllowed) {
            for (var i = 0; i < pawn.movePattern.length; i++) {
                let newPosition = addVectors(pawn.position, pawn.movePattern[i])
                if (getPiece(newPosition)) { break }
                else {
                    if(isOnBoard(newPosition)) moves.push(newPosition)
                }
            }
        } else {
            let newPosition = addVectors(pawn.position, pawn.movePattern[0])
            if (!getPiece(newPosition)) {
                if(isOnBoard(newPosition)) moves.push(newPosition)
            }
        }
        //look for captures
        for(var i = 0; i < pawn.captures.length; i++) {
            let newPosition = addVectors(pawn.position, pawn.captures[i])
           
            if(isOnBoard(newPosition)) {
                let piece = getPiece(newPosition)           
                if (piece && isEnemyPiece(getSquare(newPosition))) {
                    moves.push(newPosition)
                }
            }       
        }
        return moves
    }

    function filterEnemyOfType (arr, type) {
        return arr.filter((position) => {
            let cell = getSquare(position)
            return (!isEmpty(cell) && cell.toLowerCase() === type && isEnemyPiece(cell))
        })
    }

    function getAttackers(square, board = currentBoard) {
        let checks = [] 
        square = toArrayCoordinates(square)

/*refactor? iterate over pieces object perhaps?
    pieces = [ {
        type: 'n'
        movepattern: [3,3,3,3]
        isPathable?: false
    },
    {

    }
]
...different case for pawns (maybe just move into own function)
*/
        //knights
        let possibleKnightChecks = getPossibleMoves(square, Pieces('n', square).movePattern)
        checks.push(...filterEnemyOfType(possibleKnightChecks, 'n'))
     
        //kings
        let possibleKingChecks = getPossibleMoves(square, Pieces('k', square).movePattern)
        checks.push(...filterEnemyOfType(possibleKingChecks, 'k'))

        // queen
        let possibleQueenChecks = getPossibleMovesPathed(square, Pieces('q', square).movePattern, board)
        checks.push(...filterEnemyOfType(possibleQueenChecks, 'q'))
 
        // rook
        let possibleRookChecks = getPossibleMovesPathed(square, Pieces('r', square).movePattern, board)
        checks.push(...filterEnemyOfType(possibleRookChecks, 'r'))

        // pathable pieces (bishop queen rook)
        let possibleBishopChecks = getPossibleMovesPathed(square, Pieces('b', square).movePattern, board)
        checks.push(...filterEnemyOfType(possibleBishopChecks, 'b'))

        //pawns
        let pawnAttacks 
        currentPlayer === 'white' ? pawnAttacks = Pieces('P', square).captures :
                                    pawnAttacks = Pieces('p', square).captures
            
        for(var i = 0; i < pawnAttacks.length; i++) {
            let newPosition = addVectors(square, pawnAttacks[i])
            if(isOnBoard(newPosition)) {
                let cell = getSquare(newPosition, board)
                if (!isEmpty(cell) && isEnemyPiece(cell) && cell.toLowerCase() === 'p') {
                    checks.push(newPosition)
                }
            }          
        }

        if (checks.length === 0) return null
        return checks.map((coor) => toAlgebraic(coor))
    }
    

    //API FUNCTIONS

    function load (fenString) { 
        if (!isValidFEN(fenString)) return false
        let result = []
        let rows = fenString.split(' ')[0].split('/') 
        rows.forEach(row => result.push(convertFenRowToArray(row)))
        currentBoard = result
        return result
    }

    function reset () {
        load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    }

    function clear () {
        load('8/8/8/8/8/8/8/8') 
    }
 
    // could be unneccessary, (move pieces obj to constants? forget constructing them?)
    function getPiece (square, board = currentBoard) {
        if (square === undefined) return null 
        let coor
        Array.isArray(square) ? coor = square : coor = toArrayCoordinates(square)    
        let pieceType = board[coor[0]][coor[1]]
        return pieceType === '-' ? null : Pieces(pieceType, [coor[0], coor[1]])
    }

    function validMoves (square) {
        let cell = getSquare(square)
        if (isEmpty(cell) || isEnemyPiece(cell)) return []

        let piece = getPiece(square)
        let moves = []
        if (cell.toLowerCase() === 'p') {
            moves = pawnMoves(piece)
        } else {
            if (piece.pathable) {
                moves = getPossibleMovesPathed(piece.position, piece.movePattern)
                        .filter(isEmptyOrEnemy)                 
            } else {
                moves = getPossibleMoves(piece.position, piece.movePattern)
                        .filter(isEmptyOrEnemy)                 
            }      
        }   
        moves = filterMovesThatPutKingInCheck(moves, toArrayCoordinates(square))

        //castling
        if(piece.type === 'k') {
            if(piece.color === 'white') {
                if(findKing() === 'E1' && castling.K) {
                    if(isCastlingLegal('H1', ['F1','G1'])) {
                        moves.push([7,6])
                    }               
                }
                if(findKing() === 'E1' && castling.Q) {
                    if(isCastlingLegal('A1', ['B1','C1','D1'])) {
                        moves.push([7,2])
                    }                     
                }
            }
            else if(piece.color === 'black') {
                if(findKing() === 'E8' && castling.k) {
                    if(isCastlingLegal('H8', ['F8','G8'])) {
                        moves.push([0,6])
                    }                
                }
                if(findKing() === 'E8' && castling.q) {
                    if(isCastlingLegal('A8', ['B8','C8','D8'])) {
                        moves.push([0,2])
                    }     
               }
            }
        }
        
        return moves.map((coordinates) => toAlgebraic(coordinates))
    }

    

    function filterMovesThatPutKingInCheck(moveArr, position) {
        return moveArr.filter((move) => {
            let boardCopy = JSON.parse(JSON.stringify(currentBoard))
            boardCopy[move[0]][move[1]] = boardCopy[position[0]][position[1]]
            boardCopy[position[0]][position[1]] = '-'
            return (boardInCheck(boardCopy, currentPlayer)) ? false : true
        })  
    }

    function boardInCheck (board, color) {
        let kingPosition = find('k', color, board)[0] 
        if (!kingPosition || kingPosition.length === 0) { return false }
        let attackers = getAttackers(kingPosition, board)
        if (!attackers) return false
        return attackers.length > 0
    }
    

    function isEmptyOrEnemy (position) {
        let cell = getSquare(position)
        return (isEmpty(cell) || isEnemyPiece(cell))
    }

    
    function place (piece, square) {
        let coor = toArrayCoordinates(square)
        currentBoard[coor[0]][coor[1]] = piece
        return Pieces(piece, [coor[0],coor[1]])
    }

    function setPlayer (color) {   
        (color === 'white' || color === 'black') ? currentPlayer = color : 
                                                   errorMessage('Color must be black or white.') 
       
    }

    function swapPlayer () {
        (currentPlayer === 'white') ? setPlayer('black') : setPlayer('white')
    }

    function find (pieceType, color, board = currentBoard) {
        return board.reduce((squares, row, j) => {
            for (var i = 0; i < row.length; i++) {
                let square = [j,i]
                let piece = getPiece(square, board)
                if (piece && piece.type === pieceType && piece.color === color) {
                    squares.push(toAlgebraic(square))
                }
            }
            return squares
        }, [])
    }

    function findKing (board = currentBoard) {
        return find('k', currentPlayer, board)[0]
    }

    function move (square1, square2) {
        let possibleMoves = validMoves(square1)
        for(let i = 0; i < possibleMoves.length; i++){
            if(possibleMoves[i] === square2) {
                makeMove(square1, square2)           
                return
            }
        }
        errorMessage('Move is invalid')
    }

    function makeMove (square1, square2) {
        let piece = getPiece(square1)
      
        // SORT THIS
        if(piece.type === 'k') {
            if(piece.color === 'white') {
                castling.K = false
                castling.Q = false
                if(square1 === 'E1' && square2 === 'G1') {
                    swapSquares('H1', 'F1')
                }
                else if(square1 === 'E1' && square2 === 'C1') {
                    swapSquares('A1', 'D1')
                }
            } 
            else if(piece.color === 'black') {
                castling.k = false
                castling.q = false
                if(square1 === 'E8' && square2 === 'G8') {
                    swapSquares('H8', 'F8')
                }
                else if(square1 === 'E8' && square2 === 'C8') {
                    swapSquares('A8', 'D8')
                }     
            }
        }
        else if(piece.type === 'r') {
            if (piece.color === 'white') {
                if (toAlgebraic(piece.position) === 'H1') {
                    castling.K = false
                } 
                else if (toAlgebraic(piece.position) === 'A1') {
                    castling.Q = false
                }
            } 
            else if(piece.color === 'black'){
                if (toAlgebraic(piece.position) === 'H8') {
                    castling.k = false
                } 
                else if (toAlgebraic(piece.position) === 'A8') {
                    castling.q = false
                }
            }
        }

        swapSquares(square1,square2)
        swapPlayer()
    }

    function swapSquares (square1, square2) {
        square1 = toArrayCoordinates(square1)
        square2 = toArrayCoordinates(square2)
        currentBoard[square2[0]][square2[1]] = currentBoard[square1[0]][square1[1]]
        currentBoard[square1[0]][square1[1]] = '-'
    }

    function isCheckmate () {
        // not checking for blocks to the check!!!! write test case
        return (inCheck() !== null && kingTrapped())          
    }

    function isStalemate () {
        return !inCheck() && kingTrapped() 
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
        getPiece,               //('E4') => returns piece object from the given square
        place,                  // (piece, square) => changes piece on a given square
        validMoves,            // ('A1') => returns the valid moves for piece on given square
        find,                 // (type, color) => finds locations of all pieces of matching type and color
        inCheck, 
        isCheckmate,             //  => returns null if no checks are found, otherwise returns the squares that are giving check
        isStalemate,
        move
    }    
}

module.exports = Chess
