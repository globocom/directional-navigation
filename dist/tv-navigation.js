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
        return toRect.top;
      },
      bottomIsBetter: function bottomIsBetter(toRect) {
        return -1 * toRect.bottom;
      },
      leftIsBetter: function leftIsBetter(toRect) {
        return toRect.left;
      },
      rightIsBetter: function rightIsBetter(toRect) {
        return -1 * toRect.right;
      }
    };
  };

  var prioritize = function prioritize(priorities) {
    var destPriority = void 0;

    for (var i = 0; i < priorities.length; i++) {
      if (priorities[i].group.length) {
        destPriority = priorities[i];
        break;
      }
    }if (!destPriority) return null;

    var destDistance = destPriority.distance;

    destPriority.group.sort(function (a, b) {
      for (var _i = 0; _i < destDistance.length; _i++) {
        var distance = destDistance[_i];
        var delta = distance(a) - distance(b);
        if (delta) return delta;
      }
      return 0;
    });

    return destPriority.group;
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

  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _config = {
    selector: '',
    straightOnly: false,
    straightOverlapThreshold: 0.35,
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
  };

  var _idPool = 0;
  var _ready = false;
  var _pause = false;
  var _sections = {};
  var _sectionCount = 0;
  var _defaultSectionId = '';
  var _lastSectionId = '';
  var _duringFocusChange = false;
  var _focusedPath = null;

  var Navigator = function () {
    function Navigator(config) {
      _classCallCheck$2(this, Navigator);

      if (config) _config = Object.assign(_config, config);
    }

    _createClass$2(Navigator, [{
      key: 'init',
      value: function init() {
        if (!_ready) {
          this.bindEvents();
          _ready = true;
        }
        Navigator.focus();
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
        _ready = false;
        _sections = {};
        _sectionCount = 0;
        _idPool = 0;
        _defaultSectionId = '';
        _lastSectionId = '';
        _duringFocusChange = false;
        _focusedPath = null;
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
        this.addEventListener(document, _config.eventPrefix + 'focused', this._handleFocused);
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
        this.removeEventListener(document, _config.eventPrefix + 'focused', this._handleFocused);
      }

      // set(<config>)
      // set(<sectionId>, <config>)

    }, {
      key: 'addFocusable',
      value: function addFocusable(config, onEnterPressHandler) {
        if (!config || Navigator._getSectionId(document.getElementById(config.id))) return;

        this.removeFocusable(config);

        var sectionId = Navigator.add(config);

        if (onEnterPressHandler) this.addEventListener(config.selector, _config.eventPrefix + 'enter-down', onEnterPressHandler);

        this._makeFocusable(sectionId);
      }
    }, {
      key: 'removeFocusable',
      value: function removeFocusable(config, onEnterPressHandler) {
        var sectionId = Navigator._getSectionId(document.getElementById(config.id));
        if (!sectionId) return;

        this.remove(sectionId);
        if (onEnterPressHandler) this.removeEventListener(_config.eventPrefix + 'enter-down', onEnterPressHandler);
      }
    }, {
      key: 'setDefaultSection',
      value: function setDefaultSection(sectionId) {
        if (sectionId) {
          if (_sections[sectionId]) _defaultSectionId = sectionId;else throw new Error('Section ' + sectionId + ' doesn\'t exist!');
        } else _defaultSectionId = '';
      }
    }, {
      key: 'getCurrentFocusedPath',
      value: function getCurrentFocusedPath() {
        return _focusedPath;
      }
    }, {
      key: 'setCurrentFocusedPath',
      value: function setCurrentFocusedPath(focusPath) {
        _focusedPath = focusPath;
        Navigator.focus(focusPath);
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
        var doMakeFocusable = function doMakeFocusable(section) {
          var tabIndexIgnoreList = section.tabIndexIgnoreList || _config.tabIndexIgnoreList;
          parseSelector(section.selector).forEach(function (element) {
            if (!matchSelector(element, tabIndexIgnoreList)) if (!element.getAttribute('tabindex')) element.setAttribute('tabindex', '-1');
          });
        };

        if (sectionId) {
          if (_sections[sectionId]) doMakeFocusable(_sections[sectionId]);else throw new Error('Section ' + sectionId + ' doesn\'t exist!');
        } else for (var id in _sections) {
          doMakeFocusable(_sections[id]);
        }
      }
    }, {
      key: '_onMouseOver',


      /**
       * Events
       */

      value: function _onMouseOver(evt) {
        var target = evt.target;

        if (!target || !target.classList.contains('focusable') && !target.closest('.focusable')) return;

        var element = target.classList.contains('focusable') ? target : target.closest('.focusable');

        Navigator._focusElement(element, Navigator._getSectionId(element));

        return preventDefault(evt);
      }
    }, {
      key: '_onMouseClickOrDown',
      value: function _onMouseClickOrDown(evt) {
        var target = evt.target;

        if (!target || !target.classList.contains('focusable') && !target.closest('.focusable')) return;

        var element = target.classList.contains('focusable') ? target : target.closest('.focusable');

        if (!Navigator.fireEvent(element, 'enter-down')) return preventDefault(evt);
      }
    }, {
      key: '_onKeyDown',
      value: function _onKeyDown(evt) {
        if (!_sectionCount || _pause || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return;

        var currentFocusedElement = Navigator._getCurrentFocusedElement();
        var currentSectionId = Navigator._getSectionId(currentFocusedElement);
        var keyMappping = getKeyMapping(evt.keyCode);

        if (!keyMappping) return;

        if (keyMappping === 'enter') if (currentFocusedElement && currentSectionId) if (!Navigator.fireEvent(currentFocusedElement, 'enter-down')) return preventDefault(evt);

        if (!currentFocusedElement) {
          if (_lastSectionId) currentFocusedElement = Navigator._getSectionLastFocusedElement(_lastSectionId);

          if (!currentFocusedElement) {
            this.focusSection();
            return preventDefault(evt);
          }
        }

        if (!currentSectionId) return;

        var willmoveProperties = {
          direction: keyMappping,
          sectionId: currentSectionId,
          cause: 'keydown'
        };

        if (Navigator.fireEvent(currentFocusedElement, 'willmove', willmoveProperties)) Navigator._focusNext(keyMappping, currentFocusedElement, currentSectionId);

        return preventDefault(evt);
      }
    }, {
      key: '_onKeyUp',
      value: function _onKeyUp(evt) {
        if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return;

        if (!_pause && _sectionCount && getKeyMapping(evt.keyCode) === 'center') {
          var currentFocusedElement = Navigator._getCurrentFocusedElement();
          if (currentFocusedElement && Navigator._getSectionId(currentFocusedElement)) if (!Navigator.fireEvent(currentFocusedElement, 'enter-up')) {
            preventDefault(evt);
          }
        }
      }
    }, {
      key: '_onFocus',
      value: function _onFocus(evt) {
        var target = evt.target;

        if (target !== window && target !== document && _sectionCount && !_duringFocusChange) {
          var sectionId = Navigator._getSectionId(target);
          if (sectionId) {
            if (_pause) {
              Navigator._focusChanged(target, sectionId);
              return;
            }

            var focusProperties = {
              sectionId: sectionId,
              native: true
            };

            var willfocusSuccess = Navigator.fireEvent(target, 'willfocus', focusProperties);
            if (willfocusSuccess) {
              Navigator.fireEvent(target, 'focused', focusProperties, false);
              Navigator._focusChanged(target, sectionId);
            } else {
              _duringFocusChange = true;
              target.blur();
              _duringFocusChange = false;
            }
          }
        }
      }
    }, {
      key: '_onBlur',
      value: function _onBlur(evt) {
        var target = evt.target;

        if (target !== window && target !== document && !_pause && _sectionCount && !_duringFocusChange && Navigator._getSectionId(target)) {
          var unfocusProperties = { native: true };
          var willunfocusSuccess = Navigator.fireEvent(target, 'willunfocus', unfocusProperties);
          if (willunfocusSuccess) {
            Navigator.fireEvent(target, 'unfocused', unfocusProperties, false);
          } else {
            _duringFocusChange = true;
            setTimeout(function () {
              target.focus();
              _duringFocusChange = false;
            });
          }
        }
      }
    }, {
      key: '_handleFocused',
      value: function _handleFocused(event) {
        if (_focusedPath !== event.detail.sectionId) this.setCurrentFocusedPath(event.detail.sectionId);
      }
    }], [{
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

          if (!_sections[sectionId]) throw new Error('Section ' + sectionId + ' doesn\'t exist!');
        } else {
          return;
        }

        for (var key in config) {
          if (_config[key] !== undefined) if (sectionId) _sections[sectionId][key] = config[key];else if (config[key] !== undefined) _config[key] = config[key];
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
        }if (!sectionId) sectionId = typeof config.id === 'string' ? config.id : Navigator._generateId();

        if (_sections[sectionId]) throw new Error('Section ' + sectionId + ' has already existed!');

        _sections[sectionId] = {};
        _sectionCount++;

        Navigator.set(sectionId, config);

        return sectionId;
      }
    }, {
      key: 'remove',
      value: function remove(sectionId) {
        if (!sectionId || typeof sectionId !== 'string') throw new Error('Please assign the "sectionId"!');

        if (_sections[sectionId]) {
          _sections[sectionId] = undefined;
          _sections = _extends({}, _sections);
          _sectionCount--;
          return true;
        }
        return false;
      }
    }, {
      key: 'disable',
      value: function disable(sectionId) {
        if (_sections[sectionId]) {
          _sections[sectionId].disabled = true;
          return true;
        }
        return false;
      }
    }, {
      key: 'enable',
      value: function enable(sectionId) {
        if (_sections[sectionId]) {
          _sections[sectionId].disabled = false;
          return true;
        }
        return false;
      }
    }, {
      key: 'pause',
      value: function pause() {
        _pause = true;
      }
    }, {
      key: 'resume',
      value: function resume() {
        _pause = false;
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

        var autoPause = !_pause && silent;

        if (autoPause) Navigator.pause();

        var result = void 0;
        if (element) {
          if (typeof element === 'string') {
            result = _sections[element] ? Navigator._focusSection(element) : Navigator._focusExtendedSelector(element);
          } else {
            var nextSectionId = Navigator._getSectionId(element);
            if (Navigator._isNavigable(element, nextSectionId)) result = Navigator._focusElement(element, nextSectionId);
          }
        } else result = Navigator._focusSection();

        if (autoPause) Navigator.resume();

        return result;
      }

      // move(<direction>)
      // move(<direction>, <selector>)

    }, {
      key: 'move',
      value: function move(dir, selector) {
        var direction = dir.toLowerCase();
        if (!getReverse(direction)) return false;

        var element = selector ? parseSelector(selector)[0] : Navigator._getCurrentFocusedElement();
        if (!element) return false;

        var sectionId = Navigator._getSectionId(element);
        if (!sectionId) return false;

        var willmoveProperties = {
          direction: direction,
          sectionId: sectionId,
          cause: 'api'
        };

        if (!Navigator.fireEvent(element, 'willmove', willmoveProperties)) return false;

        return Navigator._focusNext(direction, element, sectionId);
      }
    }, {
      key: 'fireEvent',
      value: function fireEvent(element, name, details) {
        var cancelable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var type = '' + _config.eventPrefix + name;
        return EventsManager.fireEvent(element, type, details, cancelable);
      }
    }, {
      key: '_navigate',
      value: function _navigate(target, direction, candidates, config) {
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

        var priorities = void 0;

        switch (direction) {
          case 'left':
            rects = rects.filter(function (element) {
              return element.center.x < targetRect.center.x;
            });
            priorities = [{
              group: rects,
              distance: [distanceFunction.nearHorizonIsBetter, distanceFunction.nearestIsBetter, distanceFunction.topIsBetter]
            }];
            break;
          case 'right':
            rects = rects.filter(function (element) {
              return element.center.x > targetRect.center.x;
            });
            priorities = [{
              group: rects,
              distance: [distanceFunction.nearHorizonIsBetter, distanceFunction.nearestIsBetter, distanceFunction.topIsBetter]
            }];
            break;
          case 'up':
            rects = rects.filter(function (element) {
              return element.center.y < targetRect.center.y;
            });
            priorities = [{
              group: rects,
              distance: [distanceFunction.nearestIsBetter, distanceFunction.nearHorizonIsBetter, distanceFunction.leftIsBetter]
            }];
            break;
          case 'down':
            rects = rects.filter(function (element) {
              return element.center.y > targetRect.center.y;
            });
            priorities = [{
              group: rects,
              distance: [distanceFunction.nearestIsBetter, distanceFunction.nearPlumbLineIsBetter, distanceFunction.topIsBetter, distanceFunction.nearTargetLeftIsBetter]
            }];
            break;
          default:
            return null;
        }

        if (config.straightOnly) priorities.pop();

        var destGroup = prioritize(priorities);
        if (!destGroup) return null;

        var dest = void 0;
        if (config.rememberSource && config.previous && config.previous.destination === target && config.previous.reverse === direction) for (var destination in destGroup) {
          if (destination.element === config.previous.target) {
            dest = destination.element;
            break;
          }
        }if (!dest) dest = destGroup[0].element;

        return dest;
      }
    }, {
      key: '_isNavigable',
      value: function _isNavigable(element, sectionId, verifySectionSelector) {
        if (!element || !sectionId || !_sections[sectionId] || _sections[sectionId].disabled) return false;

        if (element.offsetWidth <= 0 && element.offsetHeight <= 0 || element.hasAttribute('disabled')) return false;

        if (verifySectionSelector && !matchSelector(element, _sections[sectionId].selector)) return false;

        if (typeof _sections[sectionId].navigableFilter === 'function') {
          if (_sections[sectionId].navigableFilter(element, sectionId) === false) return false;
        } else if (typeof _config.navigableFilter === 'function') {
          if (_config.navigableFilter(element, sectionId) === false) return false;
        }
        return true;
      }
    }, {
      key: '_focusNext',
      value: function _focusNext(direction, currentFocusedElement, currentSectionId) {
        var extSelector = currentFocusedElement.getAttribute('data-sn-' + direction);
        if (typeof extSelector === 'string') {
          if (extSelector === '' || !Navigator._focusExtendedSelector(extSelector, direction)) {
            Navigator._fireNavigateFailed(currentFocusedElement, direction);
            return false;
          }
          return true;
        }

        var sectionNavigableElements = {};
        var allNavigableElements = [];
        for (var id in _sections) {
          sectionNavigableElements[id] = Navigator._getSectionNavigableElements(id);
          allNavigableElements = allNavigableElements.concat(sectionNavigableElements[id]);
        }

        var config = _extends({}, _config, _sections[currentSectionId]);
        var next = void 0,
            candidates = void 0;

        if (config.restrict === 'self-only' || config.restrict === 'self-first') {
          var currentSectionNavigableElements = sectionNavigableElements[currentSectionId];
          candidates = exclude(currentSectionNavigableElements, currentFocusedElement);
          next = Navigator._navigate(currentFocusedElement, direction, candidates, config);

          if (!next && config.restrict === 'self-first') {
            candidates = exclude(allNavigableElements, currentSectionNavigableElements);
            next = Navigator._navigate(currentFocusedElement, direction, candidates, config);
          }
        } else {
          candidates = exclude(allNavigableElements, currentFocusedElement);
          next = Navigator._navigate(currentFocusedElement, direction, candidates, config);
        }

        if (next) {
          _sections[currentSectionId].previous = {
            target: currentFocusedElement,
            destination: next,
            reverse: getReverse(direction)
          };

          var nextSectionId = Navigator._getSectionId(next);

          if (currentSectionId !== nextSectionId) {
            var result = Navigator._gotoLeaveFor(currentSectionId, direction);
            if (result) {
              return true;
            } else if (result === null) {
              Navigator._fireNavigateFailed(currentFocusedElement, direction);
              return false;
            }

            var enterToElement = void 0;
            switch (_sections[nextSectionId].enterTo) {
              case 'last-focused':
                enterToElement = Navigator._getSectionLastFocusedElement(nextSectionId) || Navigator._getSectionDefaultElement(nextSectionId);
                break;
              case 'default-element':
                enterToElement = Navigator._getSectionDefaultElement(nextSectionId);
                break;
            }
            if (enterToElement) next = enterToElement;
          }
          return Navigator._focusElement(next, nextSectionId, direction);
        } else if (Navigator._gotoLeaveFor(currentSectionId, direction)) {
          return true;
        }

        Navigator._fireNavigateFailed(currentFocusedElement, direction);
        return false;
      }
    }, {
      key: '_focusChanged',
      value: function _focusChanged(element, sectionId) {
        var section = sectionId || Navigator._getSectionId(element);

        if (section) {
          _sections[section].lastFocusedElement = element;
          _lastSectionId = section;
        }
      }
    }, {
      key: '_focusElement',
      value: function _focusElement(element, sectionId, direction) {
        if (!element) return false;

        var currentFocusedElement = Navigator._getCurrentFocusedElement();

        var silentFocus = function silentFocus() {
          if (currentFocusedElement) currentFocusedElement.blur();

          element.focus();
          Navigator._focusChanged(element, sectionId);
        };

        if (_duringFocusChange) {
          silentFocus();
          return true;
        }

        _duringFocusChange = true;

        if (_pause) {
          silentFocus();
          _duringFocusChange = false;
          return true;
        }

        if (currentFocusedElement) {
          var unfocusProperties = {
            nextElement: element,
            nextSectionId: sectionId,
            direction: direction,
            native: false
          };
          if (!Navigator.fireEvent(currentFocusedElement, 'willunfocus', unfocusProperties)) {
            _duringFocusChange = false;
            return false;
          }
          currentFocusedElement.blur();
          Navigator.fireEvent(currentFocusedElement, 'unfocused', unfocusProperties, false);
        }

        var focusProperties = {
          previousElement: currentFocusedElement,
          sectionId: sectionId,
          direction: direction,
          native: false
        };

        if (!Navigator.fireEvent(element, 'willfocus', focusProperties)) {
          _duringFocusChange = false;
          return false;
        }

        element.focus();
        Navigator.fireEvent(element, 'focused', focusProperties, false);

        _duringFocusChange = false;

        Navigator._focusChanged(element, sectionId);
        return true;
      }
    }, {
      key: '_focusSection',
      value: function _focusSection(sectionId) {
        var range = [];
        var addRange = function addRange(id) {
          if (id && range.indexOf(id) < 0 && _sections[id] && !_sections[id].disabled) range.push(id);
        };

        if (sectionId) {
          addRange(sectionId);
        } else {
          addRange(_defaultSectionId);
          addRange(_lastSectionId);
          Object.keys(_sections).map(addRange);
        }

        for (var i = 0; i < range.length; i++) {
          var id = range[i];
          var next = void 0;

          if (_sections[id].enterTo === 'last-focused') next = Navigator._getSectionLastFocusedElement(id) || Navigator._getSectionDefaultElement(id) || Navigator._getSectionNavigableElements(id)[0];else next = Navigator._getSectionDefaultElement(id) || Navigator._getSectionLastFocusedElement(id) || Navigator._getSectionNavigableElements(id)[0];

          if (next) return Navigator._focusElement(next, id);
        }

        return false;
      }
    }, {
      key: '_focusExtendedSelector',
      value: function _focusExtendedSelector(selector, direction) {
        if (selector.charAt(0) === '@') {
          if (selector.length === 1) return Navigator._focusSection();
          var sectionId = selector.substr(1);
          return Navigator._focusSection(sectionId);
        }

        var _parseSelector = parseSelector(selector),
            _parseSelector2 = _slicedToArray(_parseSelector, 1),
            next = _parseSelector2[0];

        if (next) {
          var nextSectionId = Navigator._getSectionId(next);
          if (Navigator._isNavigable(next, nextSectionId)) return Navigator._focusElement(next, nextSectionId, direction);
        }
        return false;
      }
    }, {
      key: '_getSectionId',
      value: function _getSectionId(element) {
        for (var id in _sections) {
          if (!_sections[id].disabled && element && matchSelector(element, _sections[id].selector)) return id;
        }
      }
    }, {
      key: '_getSectionNavigableElements',
      value: function _getSectionNavigableElements(sectionId) {
        return parseSelector(_sections[sectionId].selector).filter(function (element) {
          return Navigator._isNavigable(element, sectionId);
        });
      }
    }, {
      key: '_getSectionDefaultElement',
      value: function _getSectionDefaultElement(sectionId) {
        var defaultElement = _sections[sectionId].defaultElement;

        if (!defaultElement) return null;

        if (typeof defaultElement === 'string') {

          var _parseSelector3 = parseSelector(defaultElement);

          var _parseSelector4 = _slicedToArray(_parseSelector3, 1);

          defaultElement = _parseSelector4[0];
        }if (Navigator._isNavigable(defaultElement, sectionId, true)) return defaultElement;

        return null;
      }
    }, {
      key: '_getSectionLastFocusedElement',
      value: function _getSectionLastFocusedElement(sectionId) {
        var lastFocusedElement = _sections[sectionId] && _sections[sectionId].lastFocusedElement;
        if (!Navigator._isNavigable(lastFocusedElement, sectionId, true)) return null;

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
        return Navigator.fireEvent(element, 'navigatefailed', { direction: direction }, false);
      }
    }, {
      key: '_gotoLeaveFor',
      value: function _gotoLeaveFor(sectionId, direction) {
        if (_sections[sectionId].leaveFor && _sections[sectionId].leaveFor[direction] !== undefined) {
          var next = _sections[sectionId].leaveFor[direction];

          if (typeof next === 'string') {
            if (next === '') return null;

            return Navigator._focusExtendedSelector(next, direction);
          }

          var nextSectionId = Navigator._getSectionId(next);
          if (Navigator._isNavigable(next, nextSectionId)) return Navigator._focusElement(next, nextSectionId, direction);
        }
        return false;
      }
    }, {
      key: '_generateId',
      value: function _generateId() {
        var id = void 0;
        do {
          id = _config.idPoolPrefix + String(++_idPool);
        } while (_sections[id]);
        return id;
      }
    }]);

    return Navigator;
  }();

  return Navigator;

})));
