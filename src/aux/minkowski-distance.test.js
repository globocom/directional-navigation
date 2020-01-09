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

    it('should return the xy distance between the source and target point without order', () => {
      const source = [0, 1]
      const target = [1, 1]

      const distance = MinkowskiDistance.calculate(source, target)

      expect(distance).toBe(1)
    })
  })

  describe('on calculating distance using chebyshev distance', () => {
    it('should return the xy distance using Number.POSITIVE_INFINITY as order', () => {
      const source = [0, 1]
      const target = [3, 3]
      const order = Number.POSITIVE_INFINITY

      const distance = MinkowskiDistance.calculate(source, target, order)

      expect(distance).toBe(3)
    })

    it('should return the xy distance using Number.NEGATIVE_INFINITY as order', () => {
      const source = [0, 1]
      const target = [3, 3]
      const order = Number.NEGATIVE_INFINITY

      const distance = MinkowskiDistance.calculate(source, target, order)

      expect(distance).toBe(2)
    })
  })
  describe('on calculating distance using improper params', () => {
    it('should throw an error when using improper number of points', () => {
      const source = [0]
      const target = [1, 1]
      const order = 2

      expect(() => MinkowskiDistance.calculate(source, target, order)).toThrowError()
    })

    it('should throw an error when using a negative order other than Number.NEGATIVE_INFINITY', () => {
      const source = [0, 1]
      const target = [1, 1]
      const order = -1

      expect(() => MinkowskiDistance.calculate(source, target, order)).toThrowError()
    })

    it('should throw an error when using a NaN order', () => {
      const source = [0, 1]
      const target = [1, 1]
      const order = 'order'

      expect(() => MinkowskiDistance.calculate(source, target, order)).toThrowError()
    })
  })
})
