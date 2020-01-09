import MinkowskiDistance from './minkowski-distance'

describe('MinkowskiDistance', () => {
  describe('on calculating distance using minkowski distance', () => {
    it('should return the xy distance between the source and target point', () => {
      const source = [0, 1]
      const target = [1, 1]
      const order = 2

      const distance = MinkowskiDistance.calculate(source, target, order)

      expect(distance).toBe(1)
    })
  })

  describe('on calculating distance using chebyshev distance', () => {
    it('should return the xy distance between the source and target point', () => {
      const source = [0, 1]
      const target = [3, 3]
      const order = Number.POSITIVE_INFINITY

      const distance = MinkowskiDistance.calculate(source, target, order)

      expect(distance).toBe(3)
    })
  })
})
