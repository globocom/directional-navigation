/**
 * The Minkowski distance between two points gets generalized
 * metric distance
 * when p === 1, this becomes same as Manhattan Distance
 * when p === 2, this becomes same as Euclidean Distance
 * when p === Positive or Negative Infinity,
 *  this becomes chebyshev distance
 *
 * @public
 *
 * @example
 * var dist = require('path-to-algorithms/src/others/' +
 * 'minkowski-distance').minkowskiDistance;
 * console.log(dist([0, 1], [1, 1], 2)); // 1
 *
 * @param {Array} x source point
 * @param {Array} y target point
 * @param {Number} p order of Minkowski distance
 * @returns {Number} distance between two points, if distance
 * is NaN, then this returns 0
 */
class MinkowskiDistance {

  chebyshevDistance (x, y, lx, p, mathfn) {
    var result = -p;
    var i;
    for (i = 0; i < lx; i += 1) {
      result = mathfn(result, Math.abs(x[i] - y[i]));
    }
    return result;
  }

  minkowskiDistance (x, lx, y, ly, p) {
    var d;
    var i;
    if (lx !== ly) {
      throw 'Both vectors should have same dimension';
    }
    if (isNaN(p)) {
      throw 'The order "p" must be a number';
    }
    if (p === Number.POSITIVE_INFINITY) {
      return this.chebyshevDistance(x, y, lx, p, Math.max);
    } else if (p === Number.NEGATIVE_INFINITY) {
      return this.chebyshevDistance(x, y, lx, p, Math.min);
    } else if (p < 1) {
      throw 'Order less than 1 will violate the triangle inequality';
    } else {
      d = 0;
      for (i = 0; i < lx; i += 1) {
        d += Math.pow(Math.abs(x[i] - y[i]), p);
      }
      return isNaN(d)
        ? 0
        : Math.pow(d, 1 / p);
    }
  }

  calculate (x, y, p) {
    return this.minkowskiDistance(x, x.length, y, y.length, p);
  }
};

export default new MinkowskiDistance();