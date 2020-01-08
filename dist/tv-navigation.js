
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.TVNavigation = factory());
}(this, (function () { 'use strict';

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var EventsManager = function () {
    function EventsManager(eventPrefix) {
      _classCallCheck(this, EventsManager);

      this._eventPrefix = eventPrefix;
    }

    _createClass(EventsManager, [{
      key: 'addListener',
      value: function addListener(target, event, handler) {
        var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        if (typeof target === 'string') document.querySelectorAll(target).forEach(function (elem) {
          return elem.addEventListener(event, handler, capture);
        });
        target.addEventListener(event, handler, capture);
      }
    }, {
      key: 'removeListener',
      value: function removeListener(target, event, handler) {
        var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        if (typeof target === 'string') document.querySelectorAll(target).forEach(function (elem) {
          return elem.removeEventListener(event, handler, capture);
        });
        target.removeEventListener(event, handler, capture);
      }
    }, {
      key: 'fireEvent',
      value: function fireEvent(element, type, details) {
        var cancelable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(this._eventPrefix + type, true, cancelable, details);
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
          }return isNaN(d) ? 0 : Math.pow(d, 1 / p);
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

  var elementMatchesSelector = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || function (selector) {
    var matchedNodes = (this.parentNode || this.document).querySelectorAll(selector);
    return [].slice.call(matchedNodes).indexOf(this) >= 0;
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
    if (typeof selector === 'string') return elementMatchesSelector.call(element, selector);else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object' && selector.length) return selector.indexOf(element) >= 0;else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object' && selector.nodeType === 1) return element === selector;
    return false;
  };

  var exclude = function exclude(elemList, excludedElem) {
    for (var element in Array.from(excludedElem)) {
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

  function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var defaultConfig = {
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

  var Navigator = function Navigator(config) {
    _classCallCheck$2(this, Navigator);

    _initialiseProps.call(this);

    Object.assign(defaultConfig, config);
    this._config = config;
    this._ready = false;
    this._idPool = 0;
    this._pause = false;
    this._sections = {};
    this._sectionCount = 0;
    this._defaultSectionId = '';
    this._lastSectionId = '';
    this._duringFocusChange = false;
    this._focusedPath = null;
    this._eventsManager = new EventsManager(this._config.eventPrefix);
  }

  // set(<config>)
  // set(<sectionId>, <config>)


  // add(<config>)
  // add(<sectionId>, <config>)


  // focus([silent])
  // focus(<sectionId>, [silent])
  // focus(<extSelector>, [silent])
  // Note: "silent" is optional and default to false


  // move(<direction>)
  // move(<direction>, <selector>)


  /**
   * Private methods
   */

  /**
   * Events
   */

  ;

  var _initialiseProps = function _initialiseProps() {
    var _this = this;

    this.init = function () {
      if (!_this._ready) {
        _this.bindEvents();
        _this._ready = true;
      }
      _this.focus();
    };

    this.destroy = function () {
      _this.clear();
      _this.unbindEvents();
    };

    this.clear = function () {
      _this._ready = false;
      _this._sections = {};
      _this._sectionCount = 0;
      _this._idPool = 0;
      _this._defaultSectionId = '';
      _this._lastSectionId = '';
      _this._duringFocusChange = false;
      _this._focusedPath = null;
    };

    this.bindEvents = function () {
      _this._eventsManager.addListener(window, 'mouseover', _this._onMouseOver);
      _this._eventsManager.addListener(window, 'mousedown', _this._onMouseDown);
      _this._eventsManager.addListener(window, 'keydown', _this._onKeyDown);
      _this._eventsManager.addListener(window, 'keyup', _this._onKeyUp);
      _this._eventsManager.addListener(window, 'focus', _this._onFocus, true);
      _this._eventsManager.addListener(window, 'blur', _this._onBlur, true);
      _this._eventsManager.addListener(document, _this._config.eventPrefix + 'focused', _this._handleFocused);
    };

    this.unbindEvents = function () {
      _this._eventsManager.removeListener(window, 'mouseover', _this._onMouseOver);
      _this._eventsManager.removeListener(window, 'mousedown', _this._onMouseDown);
      _this._eventsManager.removeListener(window, 'keydown', _this._onKeyDown);
      _this._eventsManager.removeListener(window, 'keyup', _this._onKeyUp);
      _this._eventsManager.removeListener(window, 'focus', _this._onFocus, true);
      _this._eventsManager.removeListener(window, 'blur', _this._onBlur, true);
      _this._eventsManager.removeListener(document, _this._config.eventPrefix + 'focused', _this._handleFocused);
    };

    this.set = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var sectionId = void 0,
          config = void 0;

      if (_typeof$1(args[0]) === 'object') {
        config = args[0];
      } else if (typeof args[0] === 'string' && _typeof$1(args[1]) === 'object') {
        sectionId = args[0];
        config = args[1];

        if (!_this._sections[sectionId]) throw new Error('Section ' + sectionId + ' doesn\'t exist!');
      } else {
        return;
      }

      for (var key in config) {
        if (_this._config[key] !== undefined) if (sectionId) _this._sections[sectionId][key] = config[key];else if (config[key] !== undefined) _this._config[key] = config[key];
      }
    };

    this.add = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var sectionId = void 0,
          config = void 0;

      if (_typeof$1(args[0]) === 'object') {
        config = args[0];
      } else if (typeof args[0] === 'string' && _typeof$1(args[1]) === 'object') {

        sectionId = args[0];
        config = args[1];
      }if (!sectionId) sectionId = typeof config.id === 'string' ? config.id : _this._generateId();

      if (_this._sections[sectionId]) throw new Error('Section ' + sectionId + ' has already existed!');

      _this._sections[sectionId] = {};
      _this._sectionCount++;

      _this.set(sectionId, config);

      return sectionId;
    };

    this.remove = function (sectionId) {
      if (!sectionId || typeof sectionId !== 'string') throw new Error('Please assign the "sectionId"!');

      if (_this._sections[sectionId]) {
        _this._sections[sectionId] = undefined;
        _this._sections = _extends({}, _this._sections);
        _this._sectionCount--;
        return true;
      }
      return false;
    };

    this.disable = function (sectionId) {
      if (_this._sections[sectionId]) {
        _this._sections[sectionId].disabled = true;
        return true;
      }
      return false;
    };

    this.enable = function (sectionId) {
      if (_this._sections[sectionId]) {
        _this._sections[sectionId].disabled = false;
        return true;
      }
      return false;
    };

    this.pause = function () {
      _this._pause = true;
    };

    this.resume = function () {
      _this._pause = false;
    };

    this.focus = function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var element = args[0],
          silent = args[1];

      if (typeof element === 'boolean' && silent === undefined) {
        silent = element;
        element = undefined;
      }

      var autoPause = !_this._pause && silent;

      if (autoPause) _this.pause();

      var result = void 0;
      if (element) {
        if (typeof element === 'string') {
          result = _this._sections[element] ? _this._focusSection(element) : _this._focusExtendedSelector(element);
        } else {
          var nextSectionId = _this._getSectionId(element);
          if (_this._isNavigable(element, nextSectionId)) result = _this._focusElement(element, nextSectionId);
        }
      } else result = _this._focusSection();

      if (autoPause) _this.resume();

      return result;
    };

    this.move = function (dir, selector) {
      var direction = dir.toLowerCase();
      if (!getReverse(direction)) return false;

      var element = selector ? parseSelector(selector)[0] : _this._getCurrentFocusedElement();
      if (!element) return false;

      var sectionId = _this._getSectionId(element);
      if (!sectionId) return false;

      var willmoveProperties = {
        direction: direction,
        sectionId: sectionId,
        cause: 'api'
      };

      if (!_this._eventsManager.fireEvent(element, 'willmove', willmoveProperties)) return false;

      return _this._focusNext(direction, element, sectionId);
    };

    this.addFocusable = function (config, onEnterPressHandler) {
      if (!config || _this._getSectionId(document.getElementById(config.id))) return;

      _this.removeFocusable(config);

      var sectionId = _this.add(config);

      if (onEnterPressHandler) _this._eventsManager.addListener(config.selector, _this._config.eventPrefix + 'enter-down', onEnterPressHandler);

      _this._makeFocusable(sectionId);
    };

    this.removeFocusable = function (config, onEnterPressHandler) {
      var sectionId = _this._getSectionId(document.getElementById(config.id));
      if (!sectionId) return;

      _this.remove(sectionId);
      if (onEnterPressHandler) _this._eventsManager.removeListener(_this._config.eventPrefix + 'enter-down', onEnterPressHandler);
    };

    this.setDefaultSection = function (sectionId) {
      if (sectionId) {
        if (_this._sections[sectionId]) _this._defaultSectionId = sectionId;else throw new Error('Section ' + sectionId + ' doesn\'t exist!');
      } else _this._defaultSectionId = '';
    };

    this.getCurrentFocusedPath = function () {
      return _this._focusedPath;
    };

    this.setCurrentFocusedPath = function (focusPath) {
      _this._focusedPath = focusPath;
      _this.focus(focusPath);
    };

    this._makeFocusable = function (sectionId) {
      var doMakeFocusable = function doMakeFocusable(section) {
        var tabIndexIgnoreList = section.tabIndexIgnoreList || _this._config.tabIndexIgnoreList;
        parseSelector(section.selector).forEach(function (element) {
          if (!matchSelector(element, tabIndexIgnoreList)) if (!element.getAttribute('tabindex')) element.setAttribute('tabindex', '-1');
        });
      };

      if (sectionId) {
        if (_this._sections[sectionId]) doMakeFocusable(_this._sections[sectionId]);else throw new Error('Section ' + sectionId + ' doesn\'t exist!');
      } else for (var id in _this._sections) {
        doMakeFocusable(_this._sections[id]);
      }
    };

    this._navigate = function (target, direction, candidates, config) {
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
    };

    this._isNavigable = function (element, sectionId, verifySectionSelector) {
      if (!element || !sectionId || !_this._sections[sectionId] || _this._sections[sectionId].disabled) return false;

      if (element.offsetWidth <= 0 && element.offsetHeight <= 0 || element.hasAttribute('disabled')) return false;

      if (verifySectionSelector && !matchSelector(element, _this._sections[sectionId].selector)) return false;

      if (typeof _this._sections[sectionId].navigableFilter === 'function') {
        if (_this._sections[sectionId].navigableFilter(element, sectionId) === false) return false;
      } else if (typeof _this._config.navigableFilter === 'function') {
        if (_this._config.navigableFilter(element, sectionId) === false) return false;
      }
      return true;
    };

    this._focusNext = function (direction, currentFocusedElement, currentSectionId) {
      var extSelector = currentFocusedElement.getAttribute('data-sn-' + direction);
      if (typeof extSelector === 'string') {
        if (extSelector === '' || !_this._focusExtendedSelector(extSelector, direction)) {
          _this._fireNavigateFailed(currentFocusedElement, direction);
          return false;
        }
        return true;
      }

      var sectionNavigableElements = {};
      var allNavigableElements = [];
      for (var id in _this._sections) {
        sectionNavigableElements[id] = _this._getSectionNavigableElements(id);
        allNavigableElements = allNavigableElements.concat(sectionNavigableElements[id]);
      }

      var config = _extends({}, _this._config, _this._sections[currentSectionId]);
      var next = void 0,
          candidates = void 0;

      if (config.restrict === 'self-only' || config.restrict === 'self-first') {
        var currentSectionNavigableElements = sectionNavigableElements[currentSectionId];
        candidates = exclude(currentSectionNavigableElements, currentFocusedElement);
        next = _this._navigate(currentFocusedElement, direction, candidates, config);

        if (!next && config.restrict === 'self-first') {
          candidates = exclude(allNavigableElements, currentSectionNavigableElements);
          next = _this._navigate(currentFocusedElement, direction, candidates, config);
        }
      } else {
        candidates = exclude(allNavigableElements, currentFocusedElement);
        next = _this._navigate(currentFocusedElement, direction, candidates, config);
      }

      if (next) {
        _this._sections[currentSectionId].previous = {
          target: currentFocusedElement,
          destination: next,
          reverse: getReverse(direction)
        };

        var nextSectionId = _this._getSectionId(next);

        if (currentSectionId !== nextSectionId) {
          var result = _this._gotoLeaveFor(currentSectionId, direction);
          if (result) {
            return true;
          } else if (result === null) {
            _this._fireNavigateFailed(currentFocusedElement, direction);
            return false;
          }

          var enterToElement = void 0;
          switch (_this._sections[nextSectionId].enterTo) {
            case 'last-focused':
              enterToElement = _this._getSectionLastFocusedElement(nextSectionId) || _this._getSectionDefaultElement(nextSectionId);
              break;
            case 'default-element':
              enterToElement = _this._getSectionDefaultElement(nextSectionId);
              break;
          }
          if (enterToElement) next = enterToElement;
        }
        return _this._focusElement(next, nextSectionId, direction);
      } else if (_this._gotoLeaveFor(currentSectionId, direction)) {
        return true;
      }

      _this._fireNavigateFailed(currentFocusedElement, direction);
      return false;
    };

    this._focusChanged = function (element, sectionId) {
      var section = sectionId || _this._getSectionId(element);

      if (section) {
        _this._sections[section].lastFocusedElement = element;
        _this._lastSectionId = section;
      }
    };

    this._focusElement = function (element, sectionId, direction) {
      if (!element) return false;

      var currentFocusedElement = _this._getCurrentFocusedElement();

      var silentFocus = function silentFocus() {
        if (currentFocusedElement) currentFocusedElement.blur();

        element.focus();
        _this._focusChanged(element, sectionId);
      };

      if (_this._duringFocusChange) {
        silentFocus();
        return true;
      }

      _this._duringFocusChange = true;

      if (_this._pause) {
        silentFocus();
        _this._duringFocusChange = false;
        return true;
      }

      if (currentFocusedElement) {
        var unfocusProperties = {
          nextElement: element,
          nextSectionId: sectionId,
          direction: direction,
          native: false
        };
        if (!_this._eventsManager.fireEvent(currentFocusedElement, 'willunfocus', unfocusProperties)) {
          _this._duringFocusChange = false;
          return false;
        }
        currentFocusedElement.blur();
        _this._eventsManager.fireEvent(currentFocusedElement, 'unfocused', unfocusProperties, false);
      }

      var focusProperties = {
        previousElement: currentFocusedElement,
        sectionId: sectionId,
        direction: direction,
        native: false
      };

      if (!_this._eventsManager.fireEvent(element, 'willfocus', focusProperties)) {
        _this._duringFocusChange = false;
        return false;
      }

      element.focus();
      _this._eventsManager.fireEvent(element, 'focused', focusProperties, false);

      _this._duringFocusChange = false;

      _this.focusChanged(element, sectionId);
      return true;
    };

    this._focusSection = function (sectionId) {
      var range = [];
      var addRange = function addRange(id) {
        if (id && range.indexOf(id) < 0 && _this._sections[id] && !_this._sections[id].disabled) range.push(id);
      };

      if (sectionId) {
        addRange(sectionId);
      } else {
        addRange(_this._defaultSectionId);
        addRange(_this._lastSectionId);
        Object.keys(_this._sections).map(addRange);
      }

      for (var i = 0; i < range.length; i++) {
        var id = range[i];
        var next = void 0;

        if (_this._sections[id].enterTo === 'last-focused') next = _this._getSectionLastFocusedElement(id) || _this._getSectionDefaultElement(id) || _this._getSectionNavigableElements(id)[0];else next = _this._getSectionDefaultElement(id) || _this._getSectionLastFocusedElement(id) || _this._getSectionNavigableElements(id)[0];

        if (next) return _this._focusElement(next, id);
      }

      return false;
    };

    this._focusExtendedSelector = function (selector, direction) {
      if (selector.charAt(0) === '@') {
        if (selector.length === 1) return _this._focusSection();
        var sectionId = selector.substr(1);
        return _this._focusSection(sectionId);
      }

      var _parseSelector = parseSelector(selector),
          _parseSelector2 = _slicedToArray(_parseSelector, 1),
          next = _parseSelector2[0];

      if (next) {
        var nextSectionId = _this._getSectionId(next);
        if (_this._isNavigable(next, nextSectionId)) return _this._focusElement(next, nextSectionId, direction);
      }
      return false;
    };

    this._getSectionId = function (element) {
      for (var id in _this._sections) {
        if (!_this._sections[id].disabled && element && matchSelector(element, _this._sections[id].selector)) return id;
      }
    };

    this._getSectionNavigableElements = function (sectionId) {
      return parseSelector(_this._sections[sectionId].selector).filter(function (element) {
        return _this._isNavigable(element, sectionId);
      });
    };

    this._getSectionDefaultElement = function (sectionId) {
      var defaultElement = _this._sections[sectionId].defaultElement;

      if (!defaultElement) return null;

      if (typeof defaultElement === 'string') {

        var _parseSelector3 = parseSelector(defaultElement);

        var _parseSelector4 = _slicedToArray(_parseSelector3, 1);

        defaultElement = _parseSelector4[0];
      }if (_this._isNavigable(defaultElement, sectionId, true)) return defaultElement;

      return null;
    };

    this._getSectionLastFocusedElement = function (sectionId) {
      var lastFocusedElement = _this._sections[sectionId] && _this._sections[sectionId].lastFocusedElement;
      if (!_this._isNavigable(lastFocusedElement, sectionId, true)) return null;

      return lastFocusedElement;
    };

    this._getCurrentFocusedElement = function () {
      var _document = document,
          activeElement = _document.activeElement;

      if (activeElement && activeElement !== document.body) return activeElement;
    };

    this._fireNavigateFailed = function (element, direction) {
      return _this._eventsManager.fireEvent(element, 'navigatefailed', { direction: direction }, false);
    };

    this._gotoLeaveFor = function (sectionId, direction) {
      if (_this._sections[sectionId].leaveFor && _this._sections[sectionId].leaveFor[direction] !== undefined) {
        var next = _this._sections[sectionId].leaveFor[direction];

        if (typeof next === 'string') {
          if (next === '') return null;

          return _this._focusExtendedSelector(next, direction);
        }

        var nextSectionId = _this._getSectionId(next);
        if (_this._isNavigable(next, nextSectionId)) return _this._focusElement(next, nextSectionId, direction);
      }
      return false;
    };

    this._generateId = function () {
      var id = void 0;
      do {
        id = _this._config.idPoolPrefix + String(++_this._idPool);
      } while (_this._sections[id]);
      return id;
    };

    this._onMouseOver = function (evt) {
      var target = evt.target;

      if (!target || !target.classList.contains('focusable') && !target.closest('.focusable')) return;

      var element = target.classList.contains('focusable') ? target : target.closest('.focusable');

      _this.focusElement(element, _this._getSectionId(element));

      return preventDefault(evt);
    };

    this._onMouseDown = function (evt) {
      var target = evt.target;

      if (!target || !target.classList.contains('focusable') && !target.closest('.focusable')) return;

      var element = target.classList.contains('focusable') ? target : target.closest('.focusable');

      if (!_this._eventsManager.fireEvent(element, 'enter-down')) return preventDefault(evt);
    };

    this._onKeyDown = function (evt) {
      if (!_this._sectionCount || _this._pause || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return;

      var currentFocusedElement = _this._getCurrentFocusedElement();
      var currentSectionId = _this._getSectionId(currentFocusedElement);
      var keyMappping = getKeyMapping(evt.keyCode);

      if (!keyMappping) return;

      if (keyMappping === 'enter') if (currentFocusedElement && currentSectionId) if (!_this._eventsManager.fireEvent(currentFocusedElement, 'enter-down')) return preventDefault(evt);

      if (!currentFocusedElement) {
        if (_this._lastSectionId) currentFocusedElement = _this._getSectionLastFocusedElement(_this._lastSectionId);

        if (!currentFocusedElement) {
          _this.focusSection();
          return preventDefault(evt);
        }
      }

      if (!currentSectionId) return;

      var willmoveProperties = {
        direction: keyMappping,
        sectionId: currentSectionId,
        cause: 'keydown'
      };

      if (_this._eventsManager.fireEvent(currentFocusedElement, 'willmove', willmoveProperties)) _this._focusNext(keyMappping, currentFocusedElement, currentSectionId);

      return preventDefault(evt);
    };

    this._onKeyUp = function (evt) {
      if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return;

      if (!_this._pause && _this._sectionCount && getKeyMapping(evt.keyCode) === 'center') {
        var currentFocusedElement = _this._getCurrentFocusedElement();
        if (currentFocusedElement && _this._getSectionId(currentFocusedElement)) if (!_this._eventsManager.fireEvent(currentFocusedElement, 'enter-up')) {
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

          var willfocusSuccess = _this._eventsManager.fireEvent(target, 'willfocus', focusProperties);
          if (willfocusSuccess) {
            _this._eventsManager.fireEvent(target, 'focused', focusProperties, false);
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
        var willunfocusSuccess = _this._eventsManager.fireEvent(target, 'willunfocus', unfocusProperties);
        if (willunfocusSuccess) {
          _this._eventsManager.fireEvent(target, 'unfocused', unfocusProperties, false);
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
  };

  return Navigator;

})));
