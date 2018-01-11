var Chess = require('../index')

const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const startPosition = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
]

const testFen1 = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2'
const testPosition1 = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','-','p','p','p','p','p'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','p','-','-','-','-','-'],
    ['-','-','-','-','P','-','-','-'],
    ['-','-','-','-','-','N','-','-'],
    ['P','P','P','P','-','P','P','P'],
    ['R','N','B','Q','K','B','-','R']
]

const emptyFen = '8/8/8/8/8/8/8/8 b KQkq - 1 2'
const emptyPosition = [
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-','-']
]

describe("Chess object", () => {
    it("should have default start position", () => { 
        var chess = Chess()
        expect(chess.position()).toEqual(startPosition)
    })
    describe("load function", () => {
        it("should produce position from start FEN string", () => {
            var chess = Chess(startFen)
            expect(chess.position()).toEqual(startPosition)
        })
        it("should produce position from valid FEN string", () => {
            var chess = Chess(testFen1)
            expect(chess.position()).toEqual(testPosition1)
        })
        it("should produce position without game data", () => {
            var chess = Chess('rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R')
            expect(chess.position()).toEqual(testPosition1)
        })
        it("should throw error when FEN string has too few rows", () => {
            var shortFen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP b KQkq - 1 2'
            expect(() => Chess(shortFen)).toThrow(new Error('Fen string has wrong number of rows.'))
        })
        it("should throw error when FEN string has too many rows", () => {
            var longFen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/8/8 b KQkq - 1 2'
            expect(() => Chess(longFen)).toThrow(new Error('Fen string has wrong number of rows.'))
        })
        it("should throw error when a row doesn't have 8 pieces", () => {
            var invalidFen = 'rnbqkbnr/pp1ppppp/6/2p5/4P3/5N2/PPPP1PPP/8 b KQkq - 1 2'
            expect(() => Chess(invalidFen)).toThrow(new Error('Fen string has a row with wrong number of pieces.'))
        })
        it("should throw error when a single piece is missing", () => {
            var invalidFen = 'rnbqkbnr/pp1ppppp/6/2p5/4P3/5N2/PPPP1PPP/8 b KQkq - 1 2'
            expect(() => Chess(invalidFen)).toThrow(new Error('Fen string has a row with wrong number of pieces.'))
        })
        it("should be able to load in a new position", () => {
            var chess = Chess()
            chess.load(testFen1)
            expect(chess.position()).toEqual(testPosition1)
        })
    })
    describe("reset function", () => {
        it("should reset board to starting position", () => {
            var chess = Chess(testFen1)
            chess.reset()
            expect(chess.position()).toEqual(startPosition)
        })
    })
    describe("clear function", () => {
        it("should set the board to an empty board", () => {
            var chess = Chess()
            chess.clear()
            expect(chess.position()).toEqual(emptyPosition)
        })
    })


    describe("get square function", () => {
        it("should return null if no square is provided", () => {
            var chess = Chess()
            var piece = chess.getSquare()
            expect(piece).toEqual(null)
        })
        it("if square is empty should return null", () => {
            var chess = Chess()
            var piece = chess.getSquare('E5')
            expect(piece).toEqual(null)
        })
        it("should return rooks", () => {
            var chess = Chess()
            var piece = chess.getSquare('A1')
            expect(piece.type).toEqual('r')
            expect(piece.color).toEqual('white')
            expect(piece.position).toEqual([7,0])
        })
        it("should return pawns", () => {
            var chess = Chess()
            var piece = chess.getSquare('C2')
            expect(piece.type).toEqual('p')
            expect(piece.color).toEqual('white')
            expect(piece.position).toEqual([6,2])
        })
        it("should return knights", () => {
            var chess = Chess()
            var piece = chess.getSquare('B8')
            expect(piece.type).toEqual('n')
            expect(piece.color).toEqual('black')
            expect(piece.position).toEqual([0,1])
        })
        it("should return bishops", () => {
            var chess = Chess()
            var piece = chess.getSquare('C8')
            expect(piece.type).toEqual('b')
            expect(piece.color).toEqual('black')
            expect(piece.position).toEqual([0,2])
        })
        it("should return queens", () => {
            var chess = Chess()
            var piece = chess.getSquare('D1')
            expect(piece.type).toEqual('q')
            expect(piece.color).toEqual('white')
            expect(piece.position).toEqual([7,3])
        })
        it("should return kings", () => {
            var chess = Chess()
            var piece = chess.getSquare('E8')
            expect(piece.type).toEqual('k')
            expect(piece.color).toEqual('black')
            expect(piece.position).toEqual([0,4])
        })
        it("should handle lower case inputs", () => {
            var chess = Chess()
            var piece = chess.getSquare('a1')
            expect(piece.type).toEqual('r')
            expect(piece.color).toEqual('white')
            expect(piece.position).toEqual([7,0])
        })
    })

    describe("place function", () => {
        it("should place a white pawn on square", () => {
            var chess = Chess()
            chess.place('P', 'E6')
            expect(chess.getSquare('E6').type).toEqual('p')
            expect(chess.getSquare('E6').color).toEqual('white')
        })
        it("should overwrite existing pieces", () => {
            var chess = Chess()
            chess.place('p', 'A1')
            expect(chess.getSquare('A1').type).toEqual('p')
            expect(chess.getSquare('A1').color).toEqual('black')
        })
        it("should return the placed piece", () => {
            var chess = Chess()
            expect(chess.place('P', 'E6').type).toEqual('p')
            expect(chess.place('P', 'E6').color).toEqual('white')
        })
        it("should place knights", () => {
            var chess = Chess()
            chess.place('n', 'E6')
            expect(chess.getSquare('E6').type).toEqual('n')
            expect(chess.getSquare('E6').color).toEqual('black')
        })
        it("should place rooks", () => {
            var chess = Chess()
            chess.place('r', 'E6')
            expect(chess.getSquare('E6').type).toEqual('r')
            expect(chess.getSquare('E6').color).toEqual('black')
        })
        it("should place queens", () => {
            var chess = Chess()
            chess.place('q', 'E6')
            expect(chess.getSquare('E6').type).toEqual('q')
            expect(chess.getSquare('E6').color).toEqual('black')
        })
        it("should place kings", () => {
            var chess = Chess()
            chess.clear()
            chess.place('K', 'A1')
            expect(chess.getSquare('A1').type).toEqual('k')
            expect(chess.getSquare('A1').color).toEqual('white')
        })
    })


    describe("valid moves", () => {
        it("should show no valid moves on empty square", () => {
            var chess = Chess()
            expect(chess.validMoves('E4')).toEqual([])
        })
        it("should be able to get valid moves of a square", () => {
            var chess = Chess()
            expect(chess.validMoves('E2').sort()).toEqual(['E3', 'E4'].sort())
        })
        it("should be able to get valid moves of a knight", () => {
            var chess = Chess()
            expect(chess.validMoves('B1').sort()).toEqual(['A3', 'C3'].sort())
        })
        it("should be able to get valid moves of a rook", () => {
            var chess = Chess()
            chess.clear()
            chess.place('r', 'A1')
            var valid = ['A2','A3','A4','A5','A6','A7','A8','B1','C1','D1','E1','F1','G1','H1']
            expect(chess.validMoves('A1').sort()).toEqual(valid.sort())
        })
        it("should be able to get valid moves of a bishop", () => {
            var chess = Chess()
            chess.clear()
            chess.place('b', 'C3')
            var valid = ['A1','B2','D4','E5','F6','G7','H8','B4','A5','D2','E1']
            expect(chess.validMoves('C3').sort()).toEqual(valid.sort())
        })
        it("should be able to get valid moves of a queen", () => {
            var chess = Chess()
            chess.clear()
            chess.place('q', 'C3')
            var valid = ['A1','B2','D4','E5','F6','G7','H8','B4','A5','D2','E1',
                         'A3','B3','D3','E3','F3','G3','H3',
                        'C1','C2','C4','C5','C6','C7','C8']
            expect(chess.validMoves('C3').sort()).toEqual(valid.sort())
        })
        it("should be able to get valid moves of a king", () => {
            var chess = Chess()
            expect(chess.validMoves('E1')).toEqual([])
        })
    })
 
})
      