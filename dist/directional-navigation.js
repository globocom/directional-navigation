(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.TVNavigation = factory());
}(this, (function () { 'use strict';

  if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
    var matches = (this.document || this.ownerDocument).querySelectorAll(s);
    var i = matches.length;
    while (--i >= 0 && matches.item(i) !== this) {/* do nothing */}
    return i > -1;
  };

  if (!Element.prototype.closest) Element.prototype.closest = function (s) {
    var el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement;
    } while (el !== null);
    return null;
  };

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var EventsManager = function () {
    function EventsManager() {
      _classCallCheck(this, EventsManager);
    }

    _createClass(EventsManager, null, [{
      key: 'addListener',
      value: function addListener(target, event, handler) {
        var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        if (typeof target === 'string') {
          var elems = document.querySelectorAll(target);
          if (elems && elems.length > 0) for (var i = 0; i < elems.length; i++) {
            elems[i].addEventListener(event, handler, capture);
          }
        } else {
          target.addEventListener(event, handler, capture);
        }
      }
    }, {
      key: 'removeListener',
      value: function removeListener(target, event, handler) {
        var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        if (typeof target === 'string') {
          var elems = document.querySelectorAll(target);
          if (elems && elems.length > 0) for (var i = 0; i < elems.length; i++) {
            elems[i].removeEventListener(event, handler, capture);
          }
        } else {
          target.removeEventListener(event, handler, capture);
        }
      }
    }, {
      key: 'fireEvent',
      value: function fireEvent(element, type, details) {
        var cancelable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(type, true, cancelable, details);
        return element.dispatchEvent(evt);
      }
    }]);

    return EventsManager;
  }();

  var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

  var MinkowskiDistance = function () {
    function MinkowskiDistance() {
      _classCallCheck$1(this, MinkowskiDistance);
    }

    _createClass$1(MinkowskiDistance, [{
      key: 'chebyshevDistance',
      value: function chebyshevDistance(x, y, lx, p, mathfn) {
        var result = -p;
        var i = void 0;
        for (i = 0; i < lx; i += 1) {
          result = mathfn(result, Math.abs(x[i] - y[i]));
        }return result;
      }
    }, {
      key: 'minkowskiDistance',
      value: function minkowskiDistance(x, lx, y, ly, p) {
        var d = void 0,
            i = void 0;
        if (lx !== ly) throw new Error('Both vectors should have same dimension');

        if (isNaN(p)) throw new Error('The order "p" must be a number');

        if (p === Number.POSITIVE_INFINITY) {
          return this.chebyshevDistance(x, y, lx, p, Math.max);
        } else if (p === Number.NEGATIVE_INFINITY) {
          return this.chebyshevDistance(x, y, lx, p, Math.min);
        } else if (p < 1) {
          throw new Error('Order less than 1 will violate the triangle inequality');
        } else {
          d = 0;
          for (i = 0; i < lx; i += 1) {
            d += Math.pow(Math.abs(x[i] - y[i]), p);
          }return Math.pow(d, 1 / p);
        }
      }
    }, {
      key: 'calculate',
      value: function calculate(x, y) {
        var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

        return this.minkowskiDistance(x, x.length, y, y.length, p);
      }
    }]);

    return MinkowskiDistance;
  }();

  var MinkowskiDistance$1 = new MinkowskiDistance();

  var getRect = function getRect(element) {
    var cr = element.getBoundingClientRect();
    var rect = {
      left: cr.left,
      top: cr.top,
      right: cr.right,
      bottom: cr.bottom,
      width: cr.width,
      height: cr.height
    };
    rect.element = element;
    rect.center = {
      x: rect.left + Math.floor(rect.width / 2),
      y: rect.top + Math.floor(rect.height / 2)
    };
    rect.center.left = rect.center.x;
    rect.center.right = rect.center.x;
    rect.center.top = rect.center.y;
    rect.center.bottom = rect.center.y;
    return rect;
  };

  var generateDistanceFunction = function generateDistanceFunction(fromRect) {
    return {
      nearestIsBetter: function nearestIsBetter(toRect) {
        var targetXY = [fromRect.center.x, fromRect.center.y];
        var d = MinkowskiDistance$1.calculate(targetXY, [toRect.center.x, toRect.center.y]);
        // console.log('>>>> nearestIsBetter ', toRect.element.id, d)
        return d;
      },
      nearPlumbLineIsBetter: function nearPlumbLineIsBetter(toRect) {
        var d = void 0;
        if (toRect.center.x < fromRect.center.x) d = fromRect.center.x - toRect.right;else d = toRect.left - fromRect.center.x;
        // console.log('>>>> nearPlumbLineIsBetter ', toRect.element.id, d)
        return d < 0 ? 0 : d;
      },
      nearHorizonIsBetter: function nearHorizonIsBetter(toRect) {
        var d = void 0;
        if (toRect.center.y < fromRect.center.y) d = fromRect.center.y - toRect.bottom;else d = toRect.top - fromRect.center.y;
        // console.log('>>>> nearHorizonIsBetter ', toRect.element.id, d)
        return d < 0 ? 0 : d;
      },
      nearTargetLeftIsBetter: function nearTargetLeftIsBetter(toRect) {
        var d = void 0;
        if (toRect.center.x < fromRect.center.x) d = fromRect.left - toRect.right;else d = toRect.left - fromRect.left;
        // console.log('>>>> nearTargetLeftIsBetter ', toRect.element.id, d)
        return d < 0 ? 0 : d;
      },
      nearTargetTopIsBetter: function nearTargetTopIsBetter(toRect) {
        var d = void 0;
        if (toRect.center.y < fromRect.center.y) d = fromRect.top - toRect.bottom;else d = toRect.top - fromRect.top;
        // console.log('>>>> nearTargetTopIsBetter ', toRect.element.id, d)
        return d < 0 ? 0 : d;
      },
      topIsBetter: function topIsBetter(toRect) {
        return -1 * toRect.top;
      },
      bottomIsBetter: function bottomIsBetter(toRect) {
        return toRect.bottom;
      },
      leftIsBetter: function leftIsBetter(toRect) {
        return -1 * toRect.left;
      },
      rightIsBetter: function rightIsBetter(toRect) {
        return toRect.right;
      }
    };
  };

  var prioritize = function prioritize(priorities) {
    var _ref = priorities || {},
        group = _ref.group,
        distance = _ref.distance;

    group && distance && group.sort(function (a, b) {
      for (var i = 0; i < distance.length; i++) {
        var distanceDelta = distance[i];
        var delta = distanceDelta(a) - distanceDelta(b);
        if (delta) return delta;
      }
      return 0;
    });

    return group;
  };

  var calculateAngle = function calculateAngle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
  };

  var isInsideAngle = function isInsideAngle(rect, sourceRect, direction) {
    var _rect$center = rect.center,
        rectX = _rect$center.x,
        rectY = _rect$center.y;
    var _sourceRect$center = sourceRect.center,
        sourceX = _sourceRect$center.x,
        sourceY = _sourceRect$center.y;


    console.log('>>>>> sourceX:', sourceX);
    // sourceX += (direction === 'left' ? -1 : 1) * (sourceRect.width / 2)
    console.log('>>>>> new sourceX:', sourceX);

    var filterAngle = void 0,
        isInside = void 0;
    var distance = calculateAngle(rectX, rectY, sourceX, sourceY);

    switch (direction) {
      case 'left':
        filterAngle = 60;
        isInside = distance <= filterAngle / 2 || distance >= 360 - filterAngle / 2;
        break;
      case 'right':
        filterAngle = 60;
        isInside = distance >= 180 - filterAngle / 2 && distance <= 180 + filterAngle / 2;
        break;
      case 'up':
        filterAngle = 120;
        // filterAngle = 170
        isInside = distance >= 90 - filterAngle / 2 && distance <= 90 + filterAngle / 2;
        break;
      case 'down':
        filterAngle = 120;
        // filterAngle = 170
        isInside = distance >= 270 - filterAngle / 2 && distance <= 270 + filterAngle / 2;
        break;
    }

    console.log('>>>>> isInsideAngle ', { isInside: isInside }, { rect: rect, sourceRect: sourceRect, direction: direction });

    return isInside;
  };

  var KEYMAPPING = {
    4: 'left',
    21: 'left',
    37: 'left',
    214: 'left',
    205: 'left',
    218: 'left',
    5: 'right',
    22: 'right',
    39: 'right',
    213: 'right',
    206: 'right',
    217: 'right',
    29460: 'up',
    19: 'up',
    38: 'up',
    211: 'up',
    203: 'up',
    215: 'up',
    29461: 'down',
    20: 'down',
    40: 'down',
    212: 'down',
    204: 'down',
    216: 'down',
    29443: 'enter',
    13: 'enter',
    67: 'enter',
    32: 'enter',
    23: 'enter',
    195: 'enter'
  };

  var getKeyMapping = function getKeyMapping(keyCode) {
    return KEYMAPPING[keyCode];
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var preventDefault = function preventDefault(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    return false;
  };

  var parseSelector = function parseSelector(selector) {
    var result = void 0;
    if (typeof selector === 'string') result = [].slice.call(document.querySelectorAll(selector));else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object' && selector.length) result = [].slice.call(selector);else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object' && selector.nodeType === 1) result = [selector];else result = [];
    return result;
  };

  var matchSelector = function matchSelector(element, selector) {
    if (typeof selector === 'string') return element.matches(selector);else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object' && selector.length) return selector.indexOf(element) >= 0;else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object' && selector.nodeType === 1) return element === selector;
    return false;
  };

  var exclude = function exclude(elemList, excludedElem) {
    var arr = new Array(excludedElem);
    for (var element in arr) {
      var index = elemList.indexOf(element);
      if (index >= 0) elemList.splice(index, 1);
    }
    return elemList;
  };

  var getReverse = function getReverse(direction) {
    return {
      left: 'right',
      up: 'down',
      right: 'left',
      down: 'up'
    }[direction];
  };

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Navigator = function () {
    function Navigator(config) {
      var _this = this;

      _classCallCheck$2(this, Navigator);

      this._onMouseOver = function (evt) {
        var target = evt.target;

        if (!target || !target.classList.contains('focusable') && !target.closest('.focusable')) return;

        var element = target.classList.contains('focusable') ? target : target.closest('.focusable');

        _this._focusElement(element, _this._getSectionId(element));

        return preventDefault(evt);
      };

      this._onMouseClickOrDown = function (evt) {
        var target = evt.target;

        if (!target || !target.classList.contains('focusable') && !target.closest('.focusable')) return;

        var element = target.classList.contains('focusable') ? target : target.closest('.focusable');

        if (!_this.fireEvent(element, 'enter-down')) return preventDefault(evt);
      };

      this._onKeyDown = function (evt) {
        if (!_this._sectionCount || _this._pause || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return;

        var currentFocusedElement = _this._getCurrentFocusedElement();
        var currentSectionId = _this._getSectionId(currentFocusedElement);
        var keyMappping = getKeyMapping(evt.keyCode);

        if (!keyMappping) return;

        if (keyMappping === 'enter') if (currentFocusedElement && currentSectionId) if (!_this.fireEvent(currentFocusedElement, 'enter-down')) return preventDefault(evt);

        if (!currentFocusedElement) {
          if (_this._lastSectionId) currentFocusedElement = _this._getSectionLastFocusedElement(_this._lastSectionId);

          if (currentFocusedElement) {
            _this.focus(currentFocusedElement);
          } else {
            _this._focusSection();
            return preventDefault(evt);
          }
        }

        currentSectionId = _this._getSectionId(currentFocusedElement);
        if (!currentSectionId) return;

        var willmoveProperties = {
          direction: keyMappping,
          sectionId: currentSectionId,
          cause: 'keydown'
        };

        if (_this.fireEvent(currentFocusedElement, 'willmove', willmoveProperties)) _this._focusNext(keyMappping, currentFocusedElement, currentSectionId);

        return preventDefault(evt);
      };

      this._onKeyUp = function (evt) {
        if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return;

        if (!_this._pause && _this._sectionCount && getKeyMapping(evt.keyCode) === 'center') {
          var currentFocusedElement = _this._getCurrentFocusedElement();
          if (currentFocusedElement && _this._getSectionId(currentFocusedElement)) if (!_this.fireEvent(currentFocusedElement, 'enter-up')) {
            preventDefault(evt);
          }
        }
      };

      this._onFocus = function (evt) {
        var target = evt.target;

        if (target !== window && target !== document && _this._sectionCount && !_this._duringFocusChange) {
          var sectionId = _this._getSectionId(target);
          if (sectionId) {
            if (_this._pause) {
              _this._focusChanged(target, sectionId);
              return;
            }

            var focusProperties = {
              sectionId: sectionId,
              native: true
            };

            var willfocusSuccess = _this.fireEvent(target, 'willfocus', focusProperties);
            if (willfocusSuccess) {
              _this.fireEvent(target, 'focused', focusProperties, false);
              _this._focusChanged(target, sectionId);
            } else {
              _this._duringFocusChange = true;
              target.blur();
              _this._duringFocusChange = false;
            }
          }
        }
      };

      this._onBlur = function (evt) {
        var target = evt.target;

        if (target !== window && target !== document && !_this._pause && _this._sectionCount && !_this._duringFocusChange && _this._getSectionId(target)) {
          var unfocusProperties = { native: true };
          var willunfocusSuccess = _this.fireEvent(target, 'willunfocus', unfocusProperties);
          if (willunfocusSuccess) {
            _this.fireEvent(target, 'unfocused', unfocusProperties, false);
          } else {
            _this._duringFocusChange = true;
            setTimeout(function () {
              target.focus();
              _this._duringFocusChange = false;
            });
          }
        }
      };

      this._handleFocused = function (event) {
        if (_this._focusedPath !== event.detail.sectionId) _this.setCurrentFocusedPath(event.detail.sectionId);
      };

      this._config = _extends({
        selector: '',
        rememberSource: false,
        disabled: false,
        defaultElement: '',
        enterTo: '',
        leaveFor: null,
        restrict: 'self-first',
        tabIndexIgnoreList: [],
        navigableFilter: null,
        eventPrefix: 'sn:',
        idPoolPrefix: 'section-'
      }, config);

      this._idPool = 0;
      this._ready = false;
      this._pause = false;
      this._sections = {};
      this._sectionCount = 0;
      this._defaultSectionId = '';
      this._lastSectionId = '';
      this._duringFocusChange = false;
      this._focusedPath = null;
    }

    _createClass$2(Navigator, [{
      key: 'init',
      value: function init() {
        if (!this._ready) {
          this.bindEvents();
          this._ready = true;
        }
        this.focus();
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.clear();
        this.unbindEvents();
      }
    }, {
      key: 'clear',
      value: function clear() {
        this._ready = false;
        this._sections = {};
        this._sectionCount = 0;
        this._idPool = 0;
        this._defaultSectionId = '';
        this._lastSectionId = '';
        this._duringFocusChange = false;
        this._focusedPath = null;
      }
    }, {
      key: 'bindEvents',
      value: function bindEvents() {
        this.addEventListener(window, 'click', this._onMouseClickOrDown);
        this.addEventListener(window, 'mouseover', this._onMouseOver);
        this.addEventListener(window, 'mousedown', this._onMouseClickOrDown);
        this.addEventListener(window, 'keydown', this._onKeyDown);
        this.addEventListener(window, 'keyup', this._onKeyUp);
        this.addEventListener(window, 'focus', this._onFocus, true);
        this.addEventListener(window, 'blur', this._onBlur, true);
        this.addEventListener(document, this._config.eventPrefix + 'focused', this._handleFocused);
      }
    }, {
      key: 'unbindEvents',
      value: function unbindEvents() {
        this.removeEventListener(window, 'click', this._onMouseClickOrDown);
        this.removeEventListener(window, 'mouseover', this._onMouseOver);
        this.removeEventListener(window, 'mousedown', this._onMouseClickOrDown);
        this.removeEventListener(window, 'keydown', this._onKeyDown);
        this.removeEventListener(window, 'keyup', this._onKeyUp);
        this.removeEventListener(window, 'focus', this._onFocus, true);
        this.removeEventListener(window, 'blur', this._onBlur, true);
        this.removeEventListener(document, this._config.eventPrefix + 'focused', this._handleFocused);
      }

      // set(<config>)
      // set(<sectionId>, <config>)

    }, {
      key: 'set',
      value: function set() {
        var sectionId = void 0,
            config = void 0;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (_typeof$1(args[0]) === 'object') {
          config = args[0];
        } else if (typeof args[0] === 'string' && _typeof$1(args[1]) === 'object') {
          sectionId = args[0];
          config = args[1];

          if (!this._sections[sectionId]) throw new Error('Section ' + sectionId + ' doesn\'t exist!');
        } else {
          return;
        }

        for (var key in config) {
          if (this._config[key] !== undefined) if (sectionId) this._sections[sectionId][key] = config[key];else if (config[key] !== undefined) this._config[key] = config[key];
        }
      }

      // add(<config>)
      // add(<sectionId>, <config>)

    }, {
      key: 'add',
      value: function add() {
        var sectionId = void 0,
            config = void 0;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (_typeof$1(args[0]) === 'object') {
          config = args[0];
        } else if (typeof args[0] === 'string' && _typeof$1(args[1]) === 'object') {

          sectionId = args[0];
          config = args[1];
        }if (!sectionId) sectionId = typeof config.id === 'string' ? config.id : this._generateId();

        if (this._sections[sectionId]) throw new Error('Section ' + sectionId + ' has already existed!');

        this._sections[sectionId] = {};
        this._sectionCount++;

        this.set(sectionId, config);

        return sectionId;
      }
    }, {
      key: 'remove',
      value: function remove(sectionId) {
        if (!sectionId || typeof sectionId !== 'string') throw new Error('Please assign the "sectionId"!');

        if (this._sections[sectionId]) {
          this._sections[sectionId] = undefined;
          this._sections = _extends({}, this._sections);
          this._sectionCount--;
          return true;
        }
        return false;
      }
    }, {
      key: 'disable',
      value: function disable(sectionId) {
        if (this._sections[sectionId]) {
          this._sections[sectionId].disabled = true;
          return true;
        }
        return false;
      }
    }, {
      key: 'enable',
      value: function enable(sectionId) {
        if (this._sections[sectionId]) {
          this._sections[sectionId].disabled = false;
          return true;
        }
        return false;
      }
    }, {
      key: 'pause',
      value: function pause() {
        this._pause = true;
      }
    }, {
      key: 'resume',
      value: function resume() {
        this._pause = false;
      }

      // focus([silent])
      // focus(<sectionId>, [silent])
      // focus(<extSelector>, [silent])
      // Note: "silent" is optional and default to false

    }, {
      key: 'focus',
      value: function focus() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var element = args[0],
            silent = args[1];

        if (typeof element === 'boolean' && silent === undefined) {
          silent = element;
          element = undefined;
        }

        var autoPause = !this._pause && silent;

        if (autoPause) this.pause();

        var result = void 0;
        if (element) {
          if (typeof element === 'string') {
            result = this._sections[element] ? this._focusSection(element) : this._focusExtendedSelector(element);
          } else {
            var nextSectionId = this._getSectionId(element);
            if (this._isNavigable(element, nextSectionId)) result = this._focusElement(element, nextSectionId);
          }
        } else result = this._focusSection();

        if (autoPause) this.resume();

        return result;
      }

      // move(<direction>)
      // move(<direction>, <selector>)

    }, {
      key: 'move',
      value: function move(dir, selector) {
        var direction = dir.toLowerCase();
        if (!getReverse(direction)) return false;

        var element = selector ? parseSelector(selector)[0] : this._getCurrentFocusedElement();
        if (!element) return false;

        var sectionId = this._getSectionId(element);
        if (!sectionId) return false;

        var willmoveProperties = {
          direction: direction,
          sectionId: sectionId,
          cause: 'api'
        };

        if (!this.fireEvent(element, 'willmove', willmoveProperties)) return false;

        return this._focusNext(direction, element, sectionId);
      }
    }, {
      key: 'fireEvent',
      value: function fireEvent(element, name, details) {
        var cancelable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var type = '' + this._config.eventPrefix + name;
        return EventsManager.fireEvent(element, type, details, cancelable);
      }
    }, {
      key: 'addFocusable',
      value: function addFocusable(config, onEnterPressHandler) {
        if (!config || this._getSectionId(document.getElementById(config.id))) return;

        this.removeFocusable(config);

        var sectionId = this.add(config);

        if (onEnterPressHandler) this.addEventListener(config.selector, this._config.eventPrefix + 'enter-down', onEnterPressHandler);

        this._makeFocusable(sectionId);
      }
    }, {
      key: 'removeFocusable',
      value: function removeFocusable(config, onEnterPressHandler) {
        var sectionId = this._getSectionId(document.getElementById(config.id));
        if (!sectionId) return;

        this.remove(sectionId);
        if (onEnterPressHandler) this.removeEventListener(this._config.eventPrefix + 'enter-down', onEnterPressHandler);
      }
    }, {
      key: 'setDefaultSection',
      value: function setDefaultSection(sectionId) {
        if (sectionId) {
          if (this._sections[sectionId]) this._defaultSectionId = sectionId;else throw new Error('Section ' + sectionId + ' doesn\'t exist!');
        } else this._defaultSectionId = '';
      }
    }, {
      key: 'getCurrentFocusedPath',
      value: function getCurrentFocusedPath() {
        return this._focusedPath;
      }
    }, {
      key: 'setCurrentFocusedPath',
      value: function setCurrentFocusedPath(focusPath) {
        this._focusedPath = focusPath;
        this.focus(focusPath);
      }
    }, {
      key: 'addEventListener',
      value: function addEventListener(target, event, handler) {
        var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        EventsManager.addListener(target, event, handler, useCapture);
      }
    }, {
      key: 'removeEventListener',
      value: function removeEventListener(target, event, handler) {
        var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        EventsManager.removeListener(target, event, handler, useCapture);
      }

      /**
       * Private methods
       */

    }, {
      key: '_makeFocusable',
      value: function _makeFocusable(sectionId) {
        var _this2 = this;

        var doMakeFocusable = function doMakeFocusable(section) {
          var tabIndexIgnoreList = section.tabIndexIgnoreList || _this2._config.tabIndexIgnoreList;
          parseSelector(section.selector).forEach(function (element) {
            if (!matchSelector(element, tabIndexIgnoreList)) if (!element.getAttribute('tabindex')) element.setAttribute('tabindex', '-1');
          });
        };

        if (sectionId) {
          if (this._sections[sectionId]) doMakeFocusable(this._sections[sectionId]);else throw new Error('Section ' + sectionId + ' doesn\'t exist!');
        } else for (var id in this._sections) {
          doMakeFocusable(this._sections[id]);
        }
      }
    }, {
      key: '_navigate',
      value: function _navigate(target, direction, candidates, config) {
        console.log('>>>>> _navigate', { target: target, direction: direction, candidates: candidates, config: config });
        if (!target || !direction || !candidates || !candidates.length) return null;

        var targetRect = getRect(target);
        if (!targetRect) return null;

        var rects = [];
        candidates.forEach(function (candidate) {
          var rect = getRect(candidate);
          if (rect) rects.push(rect);
        });

        if (!rects.length) return null;

        var distanceFunction = generateDistanceFunction(targetRect);
        rects = rects.filter(function (rect) {
          return rect.element !== targetRect.element && isInsideAngle(rect, targetRect, direction);
        });
        var prioritiesFunctions = function prioritiesFunctions(direction) {
          return {
            left: {
              group: rects,
              distance: [
              // distanceFunction.leftIsBetter,
              distanceFunction.nearHorizonIsBetter, distanceFunction.nearestIsBetter, distanceFunction.topIsBetter]
            },
            right: {
              group: rects,
              distance: [
              // distanceFunction.rightIsBetter,
              distanceFunction.nearHorizonIsBetter, distanceFunction.nearestIsBetter, distanceFunction.topIsBetter]
            },
            up: {
              group: rects,
              distance: [
              // distanceFunction.topIsBetter,
              distanceFunction.nearestIsBetter, distanceFunction.nearHorizonIsBetter, distanceFunction.leftIsBetter]
            },
            down: {
              group: rects,
              distance: [
              // distanceFunction.bottomIsBetter,
              distanceFunction.nearestIsBetter, distanceFunction.nearPlumbLineIsBetter, distanceFunction.topIsBetter, distanceFunction.nearTargetLeftIsBetter]
            }
          }[direction];
        };
        var priorities = prioritiesFunctions(direction);
        var destGroup = prioritize(priorities);
        console.log('>>>>> _navigate, destGroup: ', destGroup);
        if (!destGroup) return null;

        var dest = void 0;
        if (config.rememberSource && config.previous && config.previous.destination === target && config.previous.reverse === direction) for (var destination in destGroup) {
          if (destination.element === config.previous.target) {
            dest = destination.element;
            break;
          }
        }if (!dest) {
          if (destGroup.length === 0) return;
          dest = destGroup[0].element;
        }

        return dest;
      }
    }, {
      key: '_isNavigable',
      value: function _isNavigable(element, sectionId, verifySectionSelector) {
        if (!element || !sectionId || !this._sections[sectionId] || this._sections[sectionId].disabled) return false;

        if (element.offsetWidth <= 0 && element.offsetHeight <= 0 || element.hasAttribute('disabled')) return false;

        if (verifySectionSelector && !matchSelector(element, this._sections[sectionId].selector)) return false;

        if (typeof this._sections[sectionId].navigableFilter === 'function') {
          if (this._sections[sectionId].navigableFilter(element, sectionId) === false) return false;
        } else if (typeof this._config.navigableFilter === 'function') {
          if (this._config.navigableFilter(element, sectionId) === false) return false;
        }
        return true;
      }
    }, {
      key: '_focusNext',
      value: function _focusNext(direction, currentFocusedElement, currentSectionId) {
        console.log('>>>>> _focusNext', { direction: direction, currentFocusedElement: currentFocusedElement, currentSectionId: currentSectionId });
        var extSelector = currentFocusedElement.getAttribute('data-sn-' + direction);
        console.log('>>>>> _focusNext', { extSelector: extSelector });
        if (typeof extSelector === 'string') {
          if (extSelector === '' || !this._focusExtendedSelector(extSelector, direction)) {
            this._fireNavigateFailed(currentFocusedElement, direction);
            return false;
          }
          return true;
        }

        var sectionNavigableElements = {};
        var allNavigableElements = [];
        for (var id in this._sections) {
          sectionNavigableElements[id] = this._getSectionNavigableElements(id);
          allNavigableElements = allNavigableElements.concat(sectionNavigableElements[id]);
        }

        var config = _extends({}, this._config, this._sections[currentSectionId]);
        var next = void 0,
            candidates = void 0;

        if (config.restrict === 'self-only' || config.restrict === 'self-first') {
          var currentSectionNavigableElements = sectionNavigableElements[currentSectionId];
          candidates = exclude(currentSectionNavigableElements, currentFocusedElement);
          next = this._navigate(currentFocusedElement, direction, candidates, config);

          if (!next && config.restrict === 'self-first') {
            candidates = exclude(allNavigableElements, currentSectionNavigableElements);
            next = this._navigate(currentFocusedElement, direction, candidates, config);
          }
        } else {
          candidates = exclude(allNavigableElements, currentFocusedElement);
          next = this._navigate(currentFocusedElement, direction, candidates, config);
        }

        console.log('>>>>> _focusNext', { candidates: candidates, next: next });

        if (next) {
          this._sections[currentSectionId].previous = {
            target: currentFocusedElement,
            destination: next,
            reverse: getReverse(direction)
          };

          var nextSectionId = this._getSectionId(next);

          if (currentSectionId !== nextSectionId) {
            var result = this._gotoLeaveFor(currentSectionId, direction);
            if (result) {
              return true;
            } else if (result === null) {
              this._fireNavigateFailed(currentFocusedElement, direction);
              return false;
            }

            var enterToElement = void 0;
            switch (this._sections[nextSectionId].enterTo) {
              case 'last-focused':
                enterToElement = this._getSectionLastFocusedElement(nextSectionId) || this._getSectionDefaultElement(nextSectionId);
                break;
              case 'default-element':
                enterToElement = this._getSectionDefaultElement(nextSectionId);
                break;
            }
            if (enterToElement) next = enterToElement;
          }
          return this._focusElement(next, nextSectionId, direction);
        } else if (this._gotoLeaveFor(currentSectionId, direction)) {
          return true;
        }

        console.log('>>>>> _focusNext, _fireNavigateFailed', { currentFocusedElement: currentFocusedElement, direction: direction });
        this._fireNavigateFailed(currentFocusedElement, direction);
        return false;
      }
    }, {
      key: '_focusChanged',
      value: function _focusChanged(element, sectionId) {
        var section = sectionId || this._getSectionId(element);

        if (section) {
          this._sections[section].lastFocusedElement = element;
          this._lastSectionId = section;
        }
      }
    }, {
      key: '_focusElement',
      value: function _focusElement(element, sectionId, direction) {
        var _this3 = this;

        if (!element) return false;

        var currentFocusedElement = this._getCurrentFocusedElement();

        var silentFocus = function silentFocus() {
          if (currentFocusedElement) currentFocusedElement.blur();

          element.focus();
          _this3._focusChanged(element, sectionId);
        };

        if (this._duringFocusChange) {
          silentFocus();
          return true;
        }

        this._duringFocusChange = true;

        if (this._pause) {
          silentFocus();
          this._duringFocusChange = false;
          return true;
        }

        if (currentFocusedElement) {
          var unfocusProperties = {
            nextElement: element,
            nextSectionId: sectionId,
            direction: direction,
            native: false
          };
          if (!this.fireEvent(currentFocusedElement, 'willunfocus', unfocusProperties)) {
            this._duringFocusChange = false;
            return false;
          }
          currentFocusedElement.blur();
          this.fireEvent(currentFocusedElement, 'unfocused', unfocusProperties, false);
        }

        var focusProperties = {
          previousElement: currentFocusedElement,
          sectionId: sectionId,
          direction: direction,
          native: false
        };

        if (!this.fireEvent(element, 'willfocus', focusProperties)) {
          this._duringFocusChange = false;
          return false;
        }

        element.focus();
        this.fireEvent(element, 'focused', focusProperties, false);

        this._duringFocusChange = false;

        this._focusChanged(element, sectionId);
        return true;
      }
    }, {
      key: '_focusSection',
      value: function _focusSection(sectionId) {
        var _this4 = this;

        var range = [];
        var addRange = function addRange(id) {
          if (id && range.indexOf(id) < 0 && _this4._sections[id] && !_this4._sections[id].disabled) range.push(id);
        };

        if (sectionId) {
          addRange(sectionId);
        } else {
          addRange(this._defaultSectionId);
          addRange(this._lastSectionId);
          Object.keys(this._sections).map(addRange);
        }

        for (var i = 0; i < range.length; i++) {
          var id = range[i];
          var next = void 0;

          if (this._sections[id].enterTo === 'last-focused') next = this._getSectionLastFocusedElement(id) || this._getSectionDefaultElement(id) || this._getSectionNavigableElements(id)[0];else next = this._getSectionDefaultElement(id) || this._getSectionLastFocusedElement(id) || this._getSectionNavigableElements(id)[0];

          if (next) return this._focusElement(next, id);
        }

        return false;
      }
    }, {
      key: '_focusExtendedSelector',
      value: function _focusExtendedSelector(selector, direction) {
        if (selector.charAt(0) === '@') {
          if (selector.length === 1) return this._focusSection();
          var sectionId = selector.substr(1);
          return this._focusSection(sectionId);
        }

        var _parseSelector = parseSelector(selector),
            _parseSelector2 = _slicedToArray(_parseSelector, 1),
            next = _parseSelector2[0];

        if (next) {
          var nextSectionId = this._getSectionId(next);
          if (this._isNavigable(next, nextSectionId)) return this._focusElement(next, nextSectionId, direction);
        }
        return false;
      }
    }, {
      key: '_getSectionId',
      value: function _getSectionId(element) {
        for (var id in this._sections) {
          if (!this._sections[id].disabled && element && matchSelector(element, this._sections[id].selector)) return id;
        }
      }
    }, {
      key: '_getSectionNavigableElements',
      value: function _getSectionNavigableElements(sectionId) {
        var _this5 = this;

        return parseSelector(this._sections[sectionId].selector).filter(function (element) {
          return _this5._isNavigable(element, sectionId);
        });
      }
    }, {
      key: '_getSectionDefaultElement',
      value: function _getSectionDefaultElement(sectionId) {
        var defaultElement = this._sections[sectionId].defaultElement;

        if (!defaultElement) return null;

        if (typeof defaultElement === 'string') {

          var _parseSelector3 = parseSelector(defaultElement);

          var _parseSelector4 = _slicedToArray(_parseSelector3, 1);

          defaultElement = _parseSelector4[0];
        }if (this._isNavigable(defaultElement, sectionId, true)) return defaultElement;

        return null;
      }
    }, {
      key: '_getSectionLastFocusedElement',
      value: function _getSectionLastFocusedElement(sectionId) {
        var lastFocusedElement = this._sections[sectionId] && this._sections[sectionId].lastFocusedElement;
        if (!this._isNavigable(lastFocusedElement, sectionId, true)) return null;

        return lastFocusedElement;
      }
    }, {
      key: '_getCurrentFocusedElement',
      value: function _getCurrentFocusedElement() {
        var _document = document,
            activeElement = _document.activeElement;

        if (activeElement && activeElement !== document.body) return activeElement;
      }
    }, {
      key: '_fireNavigateFailed',
      value: function _fireNavigateFailed(element, direction) {
        return this.fireEvent(element, 'navigatefailed', { direction: direction }, false);
      }
    }, {
      key: '_gotoLeaveFor',
      value: function _gotoLeaveFor(sectionId, direction) {
        if (this._sections[sectionId].leaveFor && this._sections[sectionId].leaveFor[direction] !== undefined) {
          var next = this._sections[sectionId].leaveFor[direction];

          if (typeof next === 'string') {
            if (next === '') return null;

            return this._focusExtendedSelector(next, direction);
          }

          var nextSectionId = this._getSectionId(next);
          if (this._isNavigable(next, nextSectionId)) return this._focusElement(next, nextSectionId, direction);
        }
        return false;
      }
    }, {
      key: '_generateId',
      value: function _generateId() {
        var id = void 0;
        do {
          id = this._config.idPoolPrefix + String(++this._idPool);
        } while (this._sections[id]);
        return id;
      }

      /**
       * Events
       */

    }]);

    return Navigator;
  }();

  return Navigator;

})));
