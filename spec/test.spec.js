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
    it("should be white to move", () => { 
        var chess = Chess()
        expect(chess.player()).toEqual('white')
    })
    it("should be black to move", () => { 
        var chess = Chess()
        chess.setPlayer('black')
        expect(chess.player()).toEqual('black')
    })
    it("should only be allowed to set player to black or white", () => { 
        var chess = Chess()
        expect(() => chess.setPlayer('blue')).toThrow(new Error('Color must be black or white.'))
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

    describe("inCheck function", () => {
        it("should return null if current player is not in check", () => {
            var chess = Chess()
            expect(chess.inCheck()).toEqual(null)
            chess.setPlayer('black')
            expect(chess.inCheck()).toEqual(null)
        })
        it("should work for knight checks on white", () => {
            var chess = Chess()
            chess.place('n','F3')
            chess.place('n', 'D3')
            expect(chess.inCheck().sort()).toEqual(['D3','F3'].sort())
        })
        it("should work for knight checks on black", () => {
            var chess = Chess()
            chess.setPlayer('black')
            chess.place('N','F6')
            chess.place('N', 'D6')
            expect(chess.inCheck().sort()).toEqual(['D6','F6'].sort())
        })
        it("should work for rook checks on white", () => {
            var chess = Chess()
            chess.clear()
            chess.place('K','A1')
            chess.place('r', 'A8')
            chess.place('r', 'H1')
            expect(chess.inCheck().sort()).toEqual(['A8','H1'].sort())
        })
        it("should work for rook checks on black", () => {
            var chess = Chess()
            chess.clear()
            chess.setPlayer('black')
            chess.place('k','A1')
            chess.place('R', 'A8')
            chess.place('R', 'H1')
            expect(chess.inCheck().sort()).toEqual(['A8','H1'].sort())
        })
        it("should work for bishop checks on white", () => {
            var chess = Chess()
            chess.clear()
            chess.place('K','C4')
            chess.place('b', 'A6')
            chess.place('b', 'A2')
            chess.place('b', 'G8')
            chess.place('b', 'E3')
            expect(chess.inCheck().sort()).toEqual(['A6','A2','G8'].sort())
        })
        it("should work for bishop checks on black", () => {
            var chess = Chess()
            chess.clear()
            chess.setPlayer('black')
            chess.place('k','C4')
            chess.place('B', 'A6')
            chess.place('B', 'A2')
            chess.place('B', 'G8')
            chess.place('B', 'E3')
            expect(chess.inCheck().sort()).toEqual(['A6','A2','G8'].sort())
        })
        it("should work for 2 kings checking each other", () => {
            var chess = Chess()
            chess.clear()
            chess.place('k','A2')
            chess.place('K', 'A1')
            expect(chess.inCheck()).toEqual(['A2'])
            chess.setPlayer('black')
            expect(chess.inCheck()).toEqual(['A1'])
        })
        it("should work for pawn checks on white", () => {
            var chess = Chess()
            chess.place('p','F2')
            expect(chess.inCheck()).toEqual(['F2'])
        })
        it("should work for pawn checks on black", () => {
            var chess = Chess()
            chess.setPlayer('black')
            chess.place('P','D7')
            expect(chess.inCheck()).toEqual(['D7'])
        })
        it("pawns should not check backwards", () => {
            var chess = Chess()
            chess.clear()
            chess.place('p', 'A2')
            chess.place('K', 'B3')
            expect(chess.inCheck('B3')).toEqual(null)
        })
        it("should work for queen checks", () => {
            var chess = Chess()
            chess.clear()
            chess.setPlayer('black')
            chess.place('k','A1')
            chess.place('Q','A8')
            chess.place('Q','H8')
            expect(chess.inCheck()).toEqual(['A8', 'H8'])
        })
        it("kings should not check over distance!", () => {
            var chess = Chess()
            chess.clear()
            chess.place('K','E2')
            chess.place('k','E7')
            expect(chess.inCheck()).toEqual(null)
        })
        
    })


    describe("get square function", () => {
        it("should return null if no square is provided", () => {
            var chess = Chess()
            var piece = chess.getPiece()
            expect(piece).toEqual(null)
        })
        it("if square is empty should return null", () => {
            var chess = Chess()
            var piece = chess.getPiece('E5')
            expect(piece).toEqual(null)
        })
        it("should return rooks", () => {
            var chess = Chess()
            var piece = chess.getPiece('A1')
            expect(piece.type).toEqual('r')
            expect(piece.color).toEqual('white')
            expect(piece.position).toEqual([7,0])
        })
        it("should return pawns", () => {
            var chess = Chess()
            var piece = chess.getPiece('C2')
            expect(piece.type).toEqual('p')
            expect(piece.color).toEqual('white')
            expect(piece.position).toEqual([6,2])
        })
        it("should return knights", () => {
            var chess = Chess()
            var piece = chess.getPiece('B8')
            expect(piece.type).toEqual('n')
            expect(piece.color).toEqual('black')
            expect(piece.position).toEqual([0,1])
        })
        it("should return bishops", () => {
            var chess = Chess()
            var piece = chess.getPiece('C8')
            expect(piece.type).toEqual('b')
            expect(piece.color).toEqual('black')
            expect(piece.position).toEqual([0,2])
        })
        it("should return queens", () => {
            var chess = Chess()
            var piece = chess.getPiece('D1')
            expect(piece.type).toEqual('q')
            expect(piece.color).toEqual('white')
            expect(piece.position).toEqual([7,3])
        })
        it("should return kings", () => {
            var chess = Chess()
            var piece = chess.getPiece('E8')
            expect(piece.type).toEqual('k')
            expect(piece.color).toEqual('black')
            expect(piece.position).toEqual([0,4])
        })
        it("should handle lower case inputs", () => {
            var chess = Chess()
            var piece = chess.getPiece('a1')
            expect(piece.type).toEqual('r')
            expect(piece.color).toEqual('white')
            expect(piece.position).toEqual([7,0])
        })
    })

    describe("place function", () => {
        it("should place a white pawn on square", () => {
            var chess = Chess()
            chess.place('P', 'E6')
            expect(chess.getPiece('E6').type).toEqual('p')
            expect(chess.getPiece('E6').color).toEqual('white')
        })
        it("should overwrite existing pieces", () => {
            var chess = Chess()
            chess.place('p', 'A1')
            expect(chess.getPiece('A1').type).toEqual('p')
            expect(chess.getPiece('A1').color).toEqual('black')
        })
        it("should return the placed piece", () => {
            var chess = Chess()
            expect(chess.place('P', 'E6').type).toEqual('p')
            expect(chess.place('P', 'E6').color).toEqual('white')
            expect(chess.place('P', 'A1').position).toEqual([7,0])
        })
        it("should place knights", () => {
            var chess = Chess()
            chess.place('n', 'E6')
            expect(chess.getPiece('E6').type).toEqual('n')
            expect(chess.getPiece('E6').color).toEqual('black')
        })
        it("should place rooks", () => {
            var chess = Chess()
            chess.place('r', 'E6')
            expect(chess.getPiece('E6').type).toEqual('r')
            expect(chess.getPiece('E6').color).toEqual('black')
        })
        it("should place queens", () => {
            var chess = Chess()
            chess.place('q', 'E6')
            expect(chess.getPiece('E6').type).toEqual('q')
            expect(chess.getPiece('E6').color).toEqual('black')
        })
        it("should place kings", () => {
            var chess = Chess()
            chess.clear()
            chess.place('K', 'A1')
            expect(chess.getPiece('A1').type).toEqual('k')
            expect(chess.getPiece('A1').color).toEqual('white')
        })

    })

    describe("find functions", () => {
        it("should return list of squares with matching piece and color", () => {
            var chess = Chess()
            expect(chess.find('p', 'white')).toEqual(['A2','B2','C2','D2','E2','F2','G2','H2'])
            expect(chess.find('p', 'black')).toEqual(['A7','B7','C7','D7','E7','F7','G7','H7'])
        })
        it("should find queen", () => {
            var chess = Chess()
            expect(chess.find('q', 'white')).toEqual(['D1'])
            expect(chess.find('q', 'black')).toEqual(['D8'])
        })
        it("should find bishops", () => {
            var chess = Chess()
            expect(chess.find('b', 'white')).toEqual(['C1', 'F1'])
            expect(chess.find('b', 'black')).toEqual(['C8', 'F8'])
        })
        it("should find rooks", () => {
            var chess = Chess()
            expect(chess.find('r', 'white')).toEqual(['A1', 'H1'])
            expect(chess.find('r', 'black')).toEqual(['A8', 'H8'])
        })
        it("should find knights", () => {
            var chess = Chess()
            expect(chess.find('n', 'white')).toEqual(['B1', 'G1'])
            expect(chess.find('n', 'black')).toEqual(['B8', 'G8'])
        })
        it("should find kings", () => {
            var chess = Chess()
            expect(chess.find('k', 'white')).toEqual(['E1'])
            expect(chess.find('k', 'black')).toEqual(['E8'])
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
            chess.place('R', 'A1')
            var valid = ['A2','A3','A4','A5','A6','A7','A8','B1','C1','D1','E1','F1','G1','H1']
            expect(chess.validMoves('A1').sort()).toEqual(valid.sort())
        })
        it("should be able to get valid moves of a bishop", () => {
            var chess = Chess()
            chess.clear()
            chess.place('B', 'C3')
            var valid = ['A1','B2','D4','E5','F6','G7','H8','B4','A5','D2','E1']
            expect(chess.validMoves('C3').sort()).toEqual(valid.sort())
        })
        it("should be able to get valid moves of a queen", () => {
            var chess = Chess()
            chess.clear()
            chess.place('Q', 'C3')
            var valid = ['A1','B2','D4','E5','F6','G7','H8','B4','A5','D2','E1',
                         'A3','B3','D3','E3','F3','G3','H3',
                        'C1','C2','C4','C5','C6','C7','C8']
            expect(chess.validMoves('C3').sort()).toEqual(valid.sort())
        })
        it("should be able to get valid moves of a king", () => {
            var chess = Chess()
            expect(chess.validMoves('E1')).toEqual([])
        })
        it("should not show squares with friendly pieces as valid", () => {
            var chess = Chess()        
            expect(chess.validMoves('A1')).toEqual([])
        })
        it("should show squares with enemy pieces as valid", () => {
            var chess = Chess()
            chess.place('B','A6')
            chess.place('P', 'B5')
            expect(chess.validMoves('A6')).toEqual(['B7'])
        })
        it("should not continue pathing over enemy pieces", () => {
            var chess = Chess()
            chess.place('Q','A8')
            expect(chess.validMoves('A8')).toEqual(['A7','B8','B7'])
        })
        it("knights should be able to capture enemies", () => {
            var chess = Chess()
            chess.clear()
            chess.place('N','A1')
            chess.place('p', 'C2')
            chess.place('P', 'B3')
            expect(chess.validMoves('A1')).toEqual(['C2'])
        })
        it("black piece should have no valid moves when it is whites turn", () => {
            var chess = Chess()
            chess.place('q', 'A7')
            expect(chess.validMoves('A7')).toEqual([])
        })
        it("white piece should have no valid moves on blacks turn", () => {
            var chess = Chess()
            chess.place('Q', 'A2')
            chess.setPlayer('black')
            expect(chess.validMoves('A2')).toEqual([])
        })
        it("black pieces have valid moves on blacks turn", () => {
            var chess = Chess()
            chess.place('n', 'A1')
            chess.setPlayer('black')
            expect(chess.validMoves('A1')).toEqual(['B3', 'C2'])
        })
        it("black pieces have valid moves on blacks turn", () => {
            var chess = Chess()
            chess.place('n', 'A1')
            chess.setPlayer('black')
            expect(chess.validMoves('A1')).toEqual(['B3', 'C2'])
        })
        it("should not allow move that puts own king in check", () => {
            var chess = Chess()
            chess.place('q', 'E6')
            chess.place('N', 'E2')
            expect(chess.validMoves('E2')).toEqual([])
        })
        it("should not allow move that puts own king in check", () => {
            var chess = Chess()
            chess.place('q', 'E6')
            chess.place('-', 'E2')
            expect(chess.inCheck()).toEqual(['E6'])
        })
        it("should show in check", () => {
            var chess = Chess()
            chess.place('q', 'E6')
            chess.place('p', 'D3')
            expect(chess.validMoves('E2')).toEqual(['E3', 'E4'])
        })
        it("should not allow move that puts own king in check on black", () => {
            var chess = Chess()
            chess.setPlayer('black')
            chess.place('n', 'E7')
            chess.place('Q', 'E2')
            expect(chess.validMoves('E7')).toEqual([])
        })
        it("should not allow capture that puts own king in check on black", () => {
            var chess = Chess()
            chess.setPlayer('black')
            chess.place('P', 'F6')
            chess.place('Q', 'E2')
            expect(chess.validMoves('E7')).toEqual(['E6', 'E5'])
        })
        it("should not allow king to move into check", () => {
            var chess = Chess()
            chess.clear()
            chess.place('K','A1')
            chess.place('r', 'B8')
            expect(chess.validMoves('A1')).toEqual(['A2'])
        })
       

        describe("pawns", () => {
            it("white should have 2 valid moves on start position", () => {
                var chess = Chess()
                expect(chess.validMoves('A2')).toEqual(['A3', 'A4'])
                expect(chess.validMoves('E2')).toEqual(['E3', 'E4'])
            })
            it("black should have 2 valid moves on start position", () => {
                var chess = Chess()
                chess.setPlayer('black')
                expect(chess.validMoves('A7')).toEqual(['A6', 'A5'])
                expect(chess.validMoves('E7')).toEqual(['E6', 'E5'])
            })
            it("should be blocked by enemy pawns", () => {
                var chess = Chess()
                chess.place('p','A3')
                expect(chess.validMoves('A2')).toEqual([])
            })
            it("should be blocked by friendly pawns", () => {
                var chess = Chess()
                chess.place('P','A3')
                expect(chess.validMoves('A2')).toEqual([])
            })
            it("should not block first move if another pawn is 2 squares infront", () => {
                var chess = Chess()
                chess.place('p','A4')
                expect(chess.validMoves('A2')).toEqual(['A3'])
            })
            it("white should only be able to move one square if it is not on starting position", () => {
                var chess = Chess()
                chess.place('P', 'A3')
                expect(chess.validMoves('A3')).toEqual(['A4'])
            })
            it("black should only be able to move one square if it is not on starting position", () => {
                var chess = Chess()
                chess.setPlayer('black')
                chess.place('p', 'A6')
                expect(chess.validMoves('A6')).toEqual(['A5'])
            })
            it("should have valid capture squares if an enemy piece is there", () => {
                var chess = Chess()
                chess.place('p', 'A3')
                chess.place('p', 'C3')
                expect(chess.validMoves('B2')).toEqual(['B3', 'B4', 'A3','C3'])
            })
            it("should not capture friendly pieces", () => {
                var chess = Chess()
                chess.place('P', 'B1')
                expect(chess.validMoves('B1')).toEqual([])
            })
            it("black should have valid capture squares if an enemy piece is there", () => {
                var chess = Chess()
                chess.setPlayer('black')
                chess.place('P', 'A6')
                chess.place('P', 'C6')
                expect(chess.validMoves('B7')).toEqual(['B6', 'B5', 'A6','C6'])
            })
            it("black should not capture friendly pieces", () => {
                var chess = Chess()
                chess.place('p', 'B8')
                expect(chess.validMoves('B8')).toEqual([])
            })
            it("should not capture backwards", () => {
                var chess = Chess()
                chess.clear()
                chess.place('p', 'A2')
                chess.place('P', 'B3')
                expect(chess.validMoves('B3')).toEqual(['B4'])
                chess.setPlayer('black')
                expect(chess.validMoves('A2')).toEqual(['A1'])
            })

        })
        describe("move function", () => {
            it("should make a valid move", () => {
                var chess = Chess()
                chess.move('E2','E4')
                expect(chess.getPiece('E4').type).toEqual('p')
                expect(chess.getPiece('E2')).toEqual(null)
            })
            it("should throw error on invalid move", () => {
                var chess = Chess()
                expect(() => chess.move('E2','E5')).toThrow(new Error ('Move is invalid'))
            })
            it("should only allow moves for current player", () => {
                var chess = Chess()
                expect(() => chess.move('E7','E5')).toThrow(new Error ('Move is invalid'))
            })
            it("should let black move on his turn", () => {
                var chess = Chess()
                chess.setPlayer('black')
                chess.move('E7','E5')
                expect(chess.getPiece('E5').type).toEqual('p')
                expect(chess.getPiece('E7')).toEqual(null)
            })
            it("should move knights", () => {
                var chess = Chess()
                chess.move('B1','C3')
                expect(chess.getPiece('C3').type).toEqual('n')
                expect(chess.getPiece('B1')).toEqual(null)
            })
            it("should move black knights", () => {
                var chess = Chess()
                chess.setPlayer('black')
                chess.move('B8','C6')
                expect(chess.getPiece('C6').type).toEqual('n')
                expect(chess.getPiece('B8')).toEqual(null)
            })
            it("should chage to the other players turn", () => {
                var chess = Chess()
                chess.move('E2','E4')
                expect(chess.player()).toEqual('black')
            })
            
        })

        describe("checkmate function", () => {
            it("should return true for checkmate position", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('q', 'C2')
                chess.place('r', 'A8')
                expect(chess.isCheckmate()).toEqual(true)
            })
            it("should return false if not checkmate", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('r', 'A8')
                expect(chess.isCheckmate()).toEqual(false)
            })
            it("should return false if stalemate", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('q', 'C2')
                expect(chess.isCheckmate()).toEqual(false)
            })
            it("should return false if piece giving check can be captured", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('q', 'B2')
                expect(chess.isCheckmate()).toEqual(false)
            })
            it("should return true if piece giving check is protected by another piece", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('q', 'B2')
                chess.place('n', 'C4')
                expect(chess.isCheckmate()).toEqual(true)
            })
            
        })
        describe("stalemate function", () => {
            it("should return false for checkmate position", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('q', 'C2')
                chess.place('r', 'A8')
                expect(chess.isStalemate()).toEqual(false)
            })
            it("should return false if not stalemate", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('r', 'A8')
                expect(chess.isStalemate()).toEqual(false)
            })
            it("should return true if stalemate", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('q', 'C2')
                expect(chess.isStalemate()).toEqual(true)
            })
            it("should return false if piece giving check can be captured", () => {
                var chess = Chess()
                chess.clear()
                chess.place('K','A1')
                chess.place('q', 'B2')
                expect(chess.isStalemate()).toEqual(false)
            })
            
        })
         
         
    })
 
})
      