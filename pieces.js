// move patterns [up(-1)/down(1), left(-1), right(1)]
const WHITE_PAWN = {
   movePattern: [[-1,0], [-2,0]]
}

const KNIGHT = {
    movePattern: [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]
}

const KING = {
    movePattern: [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,0],[-1,1],[-1,-1]]
}

const ROOK = {
    movePattern: [[1,0],[0,1],[-1,0],[0,-1]]
}

const BISHOP = {
    movePattern: [[1,1],[-1,-1],[1,-1],[-1,1]]
}

const QUEEN = {
    movePattern: [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]
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
   
    switch (piece.type) {
        case 'p': {
            return newPiece = Object.assign(piece, WHITE_PAWN)
        }
        case 'r': {
            return newPiece = Object.assign(piece, ROOK)
        }
        case 'n': {
            return newPiece = Object.assign(piece, KNIGHT)
        }
        case 'b': {
            return newPiece = Object.assign(piece, BISHOP)
        }
        case 'q': {
            return newPiece = Object.assign(piece, QUEEN)
        }
        case 'k': {
            return newPiece = Object.assign(piece, KING)
        }
    }
  
}  

function isLowerCase (char) {
  return char === char.toLowerCase()
}


module.exports = Piece