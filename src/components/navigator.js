/**
 * Copyright (c) 2020-present, Vitor Cavalcanti
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
 * Inspired on luke-chang/js-spatial-navigation
 */

import '../misc/polyfills'
import EventsManager from './events-manager'
import { getRect, generateDistanceFunction, prioritize } from './core-functions'
import { getKeyMapping } from '../misc/key-mapping'
import {
  exclude,
  getReverse,
  matchSelector,
  parseSelector,
  preventDefault,
} from '../misc/utils'

let _config = {
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
  idPoolPrefix: 'section-',
}

let _idPool = 0
let _ready = false
let _pause = false
let _sections = {}
let _sectionCount = 0
let _defaultSectionId = ''
let _lastSectionId = ''
let _duringFocusChange = false
let _focusedPath = null

export default class Navigator {
  constructor(config) {
    if (config)
      _config = Object.assign(_config, config)
  }

  init() {
    if (!_ready) {
      this.bindEvents()
      _ready = true
    }
    Navigator.focus()
  }

  destroy() {
    this.clear()
    this.unbindEvents()
  }

  clear() {
    _ready = false
    _sections = {}
    _sectionCount = 0
    _idPool = 0
    _defaultSectionId = ''
    _lastSectionId = ''
    _duringFocusChange = false
    _focusedPath = null
  }

  bindEvents() {
    this.addEventListener(window, 'click', this._onMouseClick)
    this.addEventListener(window, 'mouseover', this._onMouseOver)
    this.addEventListener(window, 'mousedown', this._onMouseDown)
    this.addEventListener(window, 'keydown', this._onKeyDown)
    this.addEventListener(window, 'keyup', this._onKeyUp)
    this.addEventListener(window, 'focus', this._onFocus, true)
    this.addEventListener(window, 'blur', this._onBlur, true)
    this.addEventListener(document, `${_config.eventPrefix}focused`, this._handleFocused)
  }

  unbindEvents() {
    this.removeEventListener(window, 'click', this._onMouseClick)
    this.removeEventListener(window, 'mouseover', this._onMouseOver)
    this.removeEventListener(window, 'mousedown', this._onMouseDown)
    this.removeEventListener(window, 'keydown', this._onKeyDown)
    this.removeEventListener(window, 'keyup', this._onKeyUp)
    this.removeEventListener(window, 'focus', this._onFocus, true)
    this.removeEventListener(window, 'blur', this._onBlur, true)
    this.removeEventListener(document, `${_config.eventPrefix}focused`, this._handleFocused)
  }

  // set(<config>)
  // set(<sectionId>, <config>)
  static set(...args) {
    let sectionId, config

    if (typeof args[0] === 'object') {
      [config] = args
    } else if (typeof args[0] === 'string' && typeof args[1] === 'object') {
      [sectionId, config] = args
      if (!_sections[sectionId])
        throw new Error(`Section ${sectionId} doesn't exist!`)
    } else {
      return
    }

    for (const key in config)
      if (_config[key] !== undefined)
        if (sectionId)
          _sections[sectionId][key] = config[key]
        else if (config[key] !== undefined)
          _config[key] = config[key]
  }

  // add(<config>)
  // add(<sectionId>, <config>)
  static add(...args) {
    let sectionId, config

    if (typeof args[0] === 'object')
      [config] = args
    else if (typeof args[0] === 'string' && typeof args[1] === 'object')
      [sectionId, config] = args

    if (!sectionId)
      sectionId = typeof config.id === 'string' ? config.id : Navigator._generateId()

    if (_sections[sectionId])
      throw new Error(`Section ${sectionId} has already existed!`)

    _sections[sectionId] = {}
    _sectionCount++

    Navigator.set(sectionId, config)

    return sectionId
  }

  static remove(sectionId) {
    if (!sectionId || typeof sectionId !== 'string')
      throw new Error('Please assign the "sectionId"!')

    if (_sections[sectionId]) {
      _sections[sectionId] = undefined
      _sections = { ..._sections }
      _sectionCount--
      return true
    }
    return false
  }

  static disable(sectionId) {
    if (_sections[sectionId]) {
      _sections[sectionId].disabled = true
      return true
    }
    return false
  }

  static enable(sectionId) {
    if (_sections[sectionId]) {
      _sections[sectionId].disabled = false
      return true
    }
    return false
  }

  static pause() {
    _pause = true
  }

  static resume() {
    _pause = false
  }

  // focus([silent])
  // focus(<sectionId>, [silent])
  // focus(<extSelector>, [silent])
  // Note: "silent" is optional and default to false
  static focus(...args) {
    let [element, silent] = args
    if (typeof element === 'boolean' && silent === undefined) {
      silent = element
      element = undefined
    }

    const autoPause = !_pause && silent

    if (autoPause)
      Navigator.pause()

    let result
    if (element)
      if (typeof element === 'string') {
        result = _sections[element]
          ? Navigator._focusSection(element)
          : Navigator._focusExtendedSelector(element)
      } else {
        const nextSectionId = Navigator._getSectionId(element)
        if (Navigator._isNavigable(element, nextSectionId))
          result = Navigator._focusElement(element, nextSectionId)
      }
    else
      result = Navigator._focusSection()

    if (autoPause)
      Navigator.resume()

    return result
  }

  // move(<direction>)
  // move(<direction>, <selector>)
  static move(dir, selector) {
    const direction = dir.toLowerCase()
    if (!getReverse(direction))
      return false

    const element = selector ? parseSelector(selector)[0] : Navigator._getCurrentFocusedElement()
    if (!element)
      return false

    const sectionId = Navigator._getSectionId(element)
    if (!sectionId)
      return false

    const willmoveProperties = {
      direction,
      sectionId,
      cause: 'api',
    }

    if (!Navigator.fireEvent(element, 'willmove', willmoveProperties))
      return false

    return Navigator._focusNext(direction, element, sectionId)
  }

  static fireEvent(element, name, details, cancelable = true) {
    const type = `${_config.eventPrefix}${name}`
    return EventsManager.fireEvent(element, type, details, cancelable)
  }

  addFocusable(config, onEnterPressHandler) {
    if (!config || Navigator._getSectionId(document.getElementById(config.id)))
      return

    this.removeFocusable(config)

    const sectionId = Navigator.add(config)

    if (onEnterPressHandler)
      this.addEventListener(config.selector, `${_config.eventPrefix}enter-down`, onEnterPressHandler)

    this._makeFocusable(sectionId)
  }

  removeFocusable(config, onEnterPressHandler) {
    const sectionId = Navigator._getSectionId(document.getElementById(config.id))
    if (!sectionId)
      return

    this.remove(sectionId)
    if (onEnterPressHandler)
      this.removeEventListener(`${_config.eventPrefix}enter-down`, onEnterPressHandler)
  }

  setDefaultSection(sectionId) {
    if (sectionId)
      if (_sections[sectionId])
        _defaultSectionId = sectionId
      else
        throw new Error(`Section ${sectionId} doesn't exist!`)
    else
      _defaultSectionId = ''
  }

  getCurrentFocusedPath() { return _focusedPath }

  setCurrentFocusedPath(focusPath) {
    _focusedPath = focusPath
    Navigator.focus(focusPath)
  }

  addEventListener(target, event, handler, useCapture = false) {
    EventsManager.addListener(target, event, handler, useCapture)
  }

  removeEventListener(target, event, handler, useCapture = false) {
    EventsManager.removeListener(target, event, handler, useCapture)
  }

  /**
   * Private methods
   */

  _makeFocusable(sectionId) {
    const doMakeFocusable = section => {
      const tabIndexIgnoreList = section.tabIndexIgnoreList || _config.tabIndexIgnoreList
      parseSelector(section.selector).forEach(element => {
        if (!matchSelector(element, tabIndexIgnoreList))
          if (!element.getAttribute('tabindex'))
            element.setAttribute('tabindex', '-1')
      })
    }

    if (sectionId)
      if (_sections[sectionId])
        doMakeFocusable(_sections[sectionId])
      else
        throw new Error(`Section ${sectionId} doesn't exist!`)
    else
      for (const id in _sections)
        doMakeFocusable(_sections[id])
  }

  static _navigate(target, direction, candidates, config) {
    if (!target || !direction || !candidates || !candidates.length)
      return null

    const targetRect = getRect(target)
    if (!targetRect)
      return null

    let rects = []
    candidates.forEach(candidate => {
      const rect = getRect(candidate)
      if (rect)
        rects.push(rect)
    })

    if (!rects.length)
      return null

    const distanceFunction = generateDistanceFunction(targetRect)

    let priorities

    switch (direction) {
    case 'left':
      rects = rects.filter(element => element.center.x < targetRect.center.x)
      priorities = [
        {
          group: rects,
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.nearestIsBetter,
            distanceFunction.topIsBetter,
          ],
        },
      ]
      break
    case 'right':
      rects = rects.filter(element => element.center.x > targetRect.center.x)
      priorities = [
        {
          group: rects,
          distance: [
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.nearestIsBetter,
            distanceFunction.topIsBetter,
          ],
        },
      ]
      break
    case 'up':
      rects = rects.filter(element => element.center.y < targetRect.center.y)
      priorities = [
        {
          group: rects,
          distance: [
            distanceFunction.nearestIsBetter,
            distanceFunction.nearHorizonIsBetter,
            distanceFunction.leftIsBetter,
          ],
        },
      ]
      break
    case 'down':
      rects = rects.filter(element => element.center.y > targetRect.center.y)
      priorities = [
        {
          group: rects,
          distance: [
            distanceFunction.nearestIsBetter,
            distanceFunction.nearPlumbLineIsBetter,
            distanceFunction.topIsBetter,
            distanceFunction.nearTargetLeftIsBetter,
          ],
        },
      ]
      break
    default:
      return null
    }

    if (config.straightOnly)
      priorities.pop()

    const destGroup = prioritize(priorities)
    if (!destGroup)
      return null

    let dest
    if (config.rememberSource
      && config.previous
      && config.previous.destination === target
      && config.previous.reverse === direction)
      for (const destination in destGroup)
        if (destination.element === config.previous.target) {
          dest = destination.element
          break
        }

    if (!dest)
      dest = destGroup[0].element

    return dest
  }

  static _isNavigable(element, sectionId, verifySectionSelector) {
    if (!element || !sectionId || !_sections[sectionId] || _sections[sectionId].disabled)
      return false

    if ((element.offsetWidth <= 0 && element.offsetHeight <= 0) || element.hasAttribute('disabled'))
      return false

    if (verifySectionSelector && !matchSelector(element, _sections[sectionId].selector))
      return false

    if (typeof _sections[sectionId].navigableFilter === 'function') {
      if (_sections[sectionId].navigableFilter(element, sectionId) === false)
        return false
    } else if (typeof _config.navigableFilter === 'function') {
      if (_config.navigableFilter(element, sectionId) === false)
        return false
    }
    return true
  }

  static _focusNext(direction, currentFocusedElement, currentSectionId) {
    const extSelector = currentFocusedElement.getAttribute(`data-sn-${direction}`)
    if (typeof extSelector === 'string') {
      if (extSelector === ''
        || !Navigator._focusExtendedSelector(extSelector, direction)) {
        Navigator._fireNavigateFailed(currentFocusedElement, direction)
        return false
      }
      return true
    }

    const sectionNavigableElements = {}
    let allNavigableElements = []
    for (const id in _sections) {
      sectionNavigableElements[id] = Navigator._getSectionNavigableElements(id)
      allNavigableElements = allNavigableElements.concat(sectionNavigableElements[id])
    }

    const config = {
      ..._config,
      ..._sections[currentSectionId],
    }
    let next, candidates

    if (config.restrict === 'self-only' || config.restrict === 'self-first') {
      const currentSectionNavigableElements = sectionNavigableElements[currentSectionId]
      candidates = exclude(currentSectionNavigableElements, currentFocusedElement)
      next = Navigator._navigate(currentFocusedElement, direction, candidates, config)

      if (!next && config.restrict === 'self-first') {
        candidates = exclude(allNavigableElements, currentSectionNavigableElements)
        next = Navigator._navigate(currentFocusedElement, direction, candidates, config)
      }
    } else {
      candidates = exclude(allNavigableElements, currentFocusedElement)
      next = Navigator._navigate(currentFocusedElement, direction, candidates, config)
    }

    if (next) {
      _sections[currentSectionId].previous = {
        target: currentFocusedElement,
        destination: next,
        reverse: getReverse(direction),
      }

      const nextSectionId = Navigator._getSectionId(next)

      if (currentSectionId !== nextSectionId) {
        const result = Navigator._gotoLeaveFor(currentSectionId, direction)
        if (result) {
          return true
        } else if (result === null) {
          Navigator._fireNavigateFailed(currentFocusedElement, direction)
          return false
        }

        let enterToElement
        switch (_sections[nextSectionId].enterTo) {
        case 'last-focused':
          enterToElement = Navigator._getSectionLastFocusedElement(nextSectionId)
          || Navigator._getSectionDefaultElement(nextSectionId)
          break
        case 'default-element':
          enterToElement = Navigator._getSectionDefaultElement(nextSectionId)
          break
        }
        if (enterToElement)
          next = enterToElement
      }
      return Navigator._focusElement(next, nextSectionId, direction)
    } else if (Navigator._gotoLeaveFor(currentSectionId, direction)) {
      return true
    }

    Navigator._fireNavigateFailed(currentFocusedElement, direction)
    return false
  }

  static _focusChanged(element, sectionId) {
    const section = sectionId || Navigator._getSectionId(element)

    if (section) {
      _sections[section].lastFocusedElement = element
      _lastSectionId = section
    }
  }

  static _focusElement(element, sectionId, direction) {
    if (!element)
      return false

    const currentFocusedElement = Navigator._getCurrentFocusedElement()

    const silentFocus = () => {
      if (currentFocusedElement)
        currentFocusedElement.blur()

      element.focus()
      Navigator._focusChanged(element, sectionId)
    }

    if (_duringFocusChange) {
      silentFocus()
      return true
    }

    _duringFocusChange = true

    if (_pause) {
      silentFocus()
      _duringFocusChange = false
      return true
    }

    if (currentFocusedElement) {
      const unfocusProperties = {
        nextElement: element,
        nextSectionId: sectionId,
        direction,
        native: false,
      }
      if (!Navigator.fireEvent(currentFocusedElement, 'willunfocus', unfocusProperties)) {
        _duringFocusChange = false
        return false
      }
      currentFocusedElement.blur()
      Navigator.fireEvent(currentFocusedElement, 'unfocused', unfocusProperties, false)
    }

    const focusProperties = {
      previousElement: currentFocusedElement,
      sectionId,
      direction,
      native: false,
    }

    if (!Navigator.fireEvent(element, 'willfocus', focusProperties)) {
      _duringFocusChange = false
      return false
    }

    element.focus()
    Navigator.fireEvent(element, 'focused', focusProperties, false)

    _duringFocusChange = false

    Navigator._focusChanged(element, sectionId)
    return true
  }

  static _focusSection(sectionId) {
    const range = []
    const addRange = id => {
      if (id && range.indexOf(id) < 0 && _sections[id] && !_sections[id].disabled)
        range.push(id)
    }

    if (sectionId) {
      addRange(sectionId)
    } else {
      addRange(_defaultSectionId)
      addRange(_lastSectionId)
      Object.keys(_sections).map(addRange)
    }

    for (let i = 0; i < range.length; i++) {
      const id = range[i]
      let next

      if (_sections[id].enterTo === 'last-focused')
        next = Navigator._getSectionLastFocusedElement(id)
        || Navigator._getSectionDefaultElement(id)
        || Navigator._getSectionNavigableElements(id)[0]
      else
        next = Navigator._getSectionDefaultElement(id)
        || Navigator._getSectionLastFocusedElement(id)
        || Navigator._getSectionNavigableElements(id)[0]

      if (next)
        return Navigator._focusElement(next, id)
    }

    return false
  }

  static _focusExtendedSelector(selector, direction) {
    if (selector.charAt(0) === '@') {
      if (selector.length === 1)
        return Navigator._focusSection()
      const sectionId = selector.substr(1)
      return Navigator._focusSection(sectionId)
    }
    const [next] = parseSelector(selector)
    if (next) {
      const nextSectionId = Navigator._getSectionId(next)
      if (Navigator._isNavigable(next, nextSectionId))
        return Navigator._focusElement(next, nextSectionId, direction)
    }
    return false
  }

  static _getSectionId(element) {
    for (const id in _sections)
      if (!_sections[id].disabled && element && matchSelector(element, _sections[id].selector))
        return id
  }

  static _getSectionNavigableElements(sectionId) {
    return parseSelector(_sections[sectionId].selector).filter(element => Navigator._isNavigable(element, sectionId))
  }

  static _getSectionDefaultElement(sectionId) {
    let { defaultElement } = _sections[sectionId]
    if (!defaultElement)
      return null

    if (typeof defaultElement === 'string')
      [defaultElement] = parseSelector(defaultElement)

    if (Navigator._isNavigable(defaultElement, sectionId, true))
      return defaultElement

    return null
  }

  static _getSectionLastFocusedElement(sectionId) {
    const lastFocusedElement = _sections[sectionId] && _sections[sectionId].lastFocusedElement
    if (!Navigator._isNavigable(lastFocusedElement, sectionId, true))
      return null

    return lastFocusedElement
  }

  static _getCurrentFocusedElement() {
    const { activeElement } = document
    if (activeElement && activeElement !== document.body)
      return activeElement
  }

  static _fireNavigateFailed(element, direction) {
    return Navigator.fireEvent(element, 'navigatefailed', { direction }, false)
  }

  static _gotoLeaveFor(sectionId, direction) {
    if (_sections[sectionId].leaveFor && _sections[sectionId].leaveFor[direction] !== undefined) {
      const next = _sections[sectionId].leaveFor[direction]

      if (typeof next === 'string') {
        if (next === '')
          return null

        return Navigator._focusExtendedSelector(next, direction)
      }

      const nextSectionId = Navigator._getSectionId(next)
      if (Navigator._isNavigable(next, nextSectionId))
        return Navigator._focusElement(next, nextSectionId, direction)
    }
    return false
  }

  static _generateId() {
    let id
    do
      id = _config.idPoolPrefix + String(++_idPool)
    while (_sections[id])
    return id
  }

  /**
   * Events
   */

  _onMouseClick(evt) {
    const { target } = evt
    if (!target || (!target.classList.contains('focusable') && !target.closest('.focusable')))
      return

    const element = target.classList.contains('focusable') ? target : target.closest('.focusable')

    Navigator._focusElement(element, Navigator._getSectionId(element))

    return preventDefault(evt)
  }

  _onMouseOver(evt) {
    const { target } = evt
    if (!target || (!target.classList.contains('focusable') && !target.closest('.focusable')))
      return

    const element = target.classList.contains('focusable') ? target : target.closest('.focusable')

    Navigator._focusElement(element, Navigator._getSectionId(element))

    return preventDefault(evt)
  }

  _onMouseDown(evt) {
    const { target } = evt
    if (!target || (!target.classList.contains('focusable') && !target.closest('.focusable')))
      return

    const element = target.classList.contains('focusable') ? target : target.closest('.focusable')

    if (!Navigator.fireEvent(element, 'enter-down'))
      return preventDefault(evt)
  }

  _onKeyDown(evt) {
    if (!_sectionCount || _pause || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)
      return

    let currentFocusedElement = Navigator._getCurrentFocusedElement()
    const currentSectionId = Navigator._getSectionId(currentFocusedElement)
    const keyMappping = getKeyMapping(evt.keyCode)

    if (!keyMappping)
      return

    if (keyMappping === 'enter')
      if (currentFocusedElement && currentSectionId)
        if (!Navigator.fireEvent(currentFocusedElement, 'enter-down'))
          return preventDefault(evt)

    if (!currentFocusedElement) {
      if (_lastSectionId)
        currentFocusedElement = Navigator._getSectionLastFocusedElement(_lastSectionId)

      if (!currentFocusedElement) {
        this.focusSection()
        return preventDefault(evt)
      }
    }

    if (!currentSectionId)
      return

    const willmoveProperties = {
      direction: keyMappping,
      sectionId: currentSectionId,
      cause: 'keydown',
    }

    if (Navigator.fireEvent(currentFocusedElement, 'willmove', willmoveProperties))
      Navigator._focusNext(keyMappping, currentFocusedElement, currentSectionId)

    return preventDefault(evt)
  }

  _onKeyUp(evt) {
    if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)
      return

    if (!_pause && _sectionCount && getKeyMapping(evt.keyCode) === 'center') {
      const currentFocusedElement = Navigator._getCurrentFocusedElement()
      if (currentFocusedElement && Navigator._getSectionId(currentFocusedElement))
        if (!Navigator.fireEvent(currentFocusedElement, 'enter-up')) {
          preventDefault(evt)
        }
    }
  }

  _onFocus(evt) {
    const { target } = evt
    if (target !== window && target !== document && _sectionCount && !_duringFocusChange) {
      const sectionId = Navigator._getSectionId(target)
      if (sectionId) {
        if (_pause) {
          Navigator._focusChanged(target, sectionId)
          return
        }

        const focusProperties = {
          sectionId,
          native: true,
        }

        const willfocusSuccess = Navigator.fireEvent(target, 'willfocus', focusProperties)
        if (willfocusSuccess) {
          Navigator.fireEvent(target, 'focused', focusProperties, false)
          Navigator._focusChanged(target, sectionId)
        } else {
          _duringFocusChange = true
          target.blur()
          _duringFocusChange = false
        }
      }
    }
  }

  _onBlur(evt) {
    const { target } = evt
    if (target !== window
      && target !== document
      && !_pause
      && _sectionCount
      && !_duringFocusChange
      && Navigator._getSectionId(target)) {
      const unfocusProperties = { native: true }
      const willunfocusSuccess = Navigator.fireEvent(target, 'willunfocus', unfocusProperties)
      if (willunfocusSuccess) {
        Navigator.fireEvent(target, 'unfocused', unfocusProperties, false)
      } else {
        _duringFocusChange = true
        setTimeout(() => {
          target.focus()
          _duringFocusChange = false
        })
      }
    }
  }

  _handleFocused(event) {
    if (_focusedPath !== event.detail.sectionId)
      this.setCurrentFocusedPath(event.detail.sectionId)
  }
}
