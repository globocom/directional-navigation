import MinkowskiDistance from '../src/minkowski-distance';

describe('MinkowskiDistance', () => {
    describe('on calculating distance using minkowski distance', () => {
        it('should return the xy distance between the source and target point', () => {
            let source = [0, 1]
            let target = [1, 1]
            let order = 2

            const distance = MinkowskiDistance.calculate(source, target, order)

            expect(distance).toBe(1)
        })
    })

    describe('on calculating distance using chebyshev distance', () => {
        it('should return the xy distance between the source and target point', () => {
            let source = [0, 1]
            let target = [3, 3]
            let order = Number.POSITIVE_INFINITY

            const distance = MinkowskiDistance.calculate(source, target, order)

            expect(distance).toBe(3)
        })
    })
});