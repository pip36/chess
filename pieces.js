// move patterns [up(-1)/down(1), left(-1), right(1)]
//pathable is true if the piece can move multiple dquares in a direction
const WHITE_PAWN = {
   movePattern: [[-1,0], [-2,0]],
   captures: [[-1,-1],[-1,1]],
   doubleMoveAllowed: true
}

const BLACK_PAWN = {
    movePattern: [[1,0], [2,0]],
    captures: [[1,-1],[1,1]],
    doubleMoveAllowed: true
 }

const KNIGHT = {
    movePattern: [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],
    pathable: false
}

const KING = {
    movePattern: [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,0],[-1,1],[-1,-1]],
    pathable: false
}

const ROOK = {
    movePattern: [[1,0],[0,1],[-1,0],[0,-1]],
    pathable: true
}

const BISHOP = {
    movePattern: [[1,1],[-1,-1],[1,-1],[-1,1]],
    pathable: true
}

const QUEEN = {
    movePattern: [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]],
    pathable: true
}

function pawnOnStartingSquare (piece) {
    if (piece.color === 'black') {
       return piece.position[0] === 1
    } else {
        return piece.position[0] === 6
    }
}


const Piece = (type, position) => {
    if(type === '-') { return {} }

    let color
    (isLowerCase(type)) ? color = 'black' : color = 'white'

    var piece = {
        type: type.toLowerCase(),
        color,
        position
    }
   
    if (piece.type === 'p') {
        let p
        if (piece.color === 'white') { 
            p = Object.assign(piece, WHITE_PAWN) 
        }
        else if (piece.color === 'black') { 
            p = Object.assign(piece, BLACK_PAWN) 
        }
        if (!pawnOnStartingSquare(p)) p.doubleMoveAllowed = false 
        return p
    }

    switch (piece.type) {
        case 'p': {
            return Object.assign(piece, WHITE_PAWN)
        }
        case 'r': {
            return Object.assign(piece, ROOK)
        }
        case 'n': {
            return Object.assign(piece, KNIGHT)
        }
        case 'b': {
            return Object.assign(piece, BISHOP)
        }
        case 'q': {
            return Object.assign(piece, QUEEN)
        }
        case 'k': {
            return Object.assign(piece, KING)
        }
    }
  
}  

function isLowerCase (char) {
  return char === char.toLowerCase()
}


module.exports = Piece