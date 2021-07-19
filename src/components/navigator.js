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
import { getRect, generateDistanceFunction, prioritize, isInsideAngle } from './core-functions'
import { getKeyMapping } from '../misc/key-mapping'
import {
  exclude,
  getReverse,
  matchSelector,
  parseSelector,
  preventDefault,
} from '../misc/utils'

export default class Navigator {
  constructor(config) {
    this._config = {
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
      idPoolPrefix: 'section-',
      ...config,
    }

    this._idPool = 0
    this._ready = false
    this._pause = false
    this._sections = {}
    this._sectionCount = 0
    this._defaultSectionId = ''
    this._lastSectionId = ''
    this._duringFocusChange = false
    this._focusedPath = null
  }

  init() {
    if (!this._ready) {
      this.bindEvents()
      this._ready = true
    }
    this.focus()
  }

  destroy() {
    this.clear()
    this.unbindEvents()
  }

  clear() {
    this._ready = false
    this._sections = {}
    this._sectionCount = 0
    this._idPool = 0
    this._defaultSectionId = ''
    this._lastSectionId = ''
    this._duringFocusChange = false
    this._focusedPath = null
  }

  bindEvents() {
    this.addEventListener(window, 'click', this._onMouseClickOrDown)
    this.addEventListener(window, 'mouseover', this._onMouseOver)
    this.addEventListener(window, 'mousedown', this._onMouseClickOrDown)
    this.addEventListener(window, 'keydown', this._onKeyDown)
    this.addEventListener(window, 'keyup', this._onKeyUp)
    this.addEventListener(window, 'focus', this._onFocus, true)
    this.addEventListener(window, 'blur', this._onBlur, true)
    this.addEventListener(document, `${this._config.eventPrefix}focused`, this._handleFocused)
  }

  unbindEvents() {
    this.removeEventListener(window, 'click', this._onMouseClickOrDown)
    this.removeEventListener(window, 'mouseover', this._onMouseOver)
    this.removeEventListener(window, 'mousedown', this._onMouseClickOrDown)
    this.removeEventListener(window, 'keydown', this._onKeyDown)
    this.removeEventListener(window, 'keyup', this._onKeyUp)
    this.removeEventListener(window, 'focus', this._onFocus, true)
    this.removeEventListener(window, 'blur', this._onBlur, true)
    this.removeEventListener(document, `${this._config.eventPrefix}focused`, this._handleFocused)
  }

  // set(<config>)
  // set(<sectionId>, <config>)
  set(...args) {
    let sectionId, config

    if (typeof args[0] === 'object') {
      [config] = args
    } else if (typeof args[0] === 'string' && typeof args[1] === 'object') {
      [sectionId, config] = args
      if (!this._sections[sectionId])
        throw new Error(`Section ${sectionId} doesn't exist!`)
    } else {
      return
    }

    for (const key in config)
      if (this._config[key] !== undefined)
        if (sectionId)
          this._sections[sectionId][key] = config[key]
        else if (config[key] !== undefined)
          this._config[key] = config[key]
  }

  // add(<config>)
  // add(<sectionId>, <config>)
  add(...args) {
    let sectionId, config

    if (typeof args[0] === 'object')
      [config] = args
    else if (typeof args[0] === 'string' && typeof args[1] === 'object')
      [sectionId, config] = args

    if (!sectionId)
      sectionId = typeof config.id === 'string' ? config.id : this._generateId()

    if (this._sections[sectionId])
      throw new Error(`Section ${sectionId} has already existed!`)

    this._sections[sectionId] = {}
    this._sectionCount++

    this.set(sectionId, config)

    return sectionId
  }

  remove(sectionId) {
    if (!sectionId || typeof sectionId !== 'string')
      throw new Error('Please assign the "sectionId"!')

    if (this._sections[sectionId]) {
      this._sections[sectionId] = undefined
      this._sections = { ...this._sections }
      this._sectionCount--
      return true
    }
    return false
  }

  disable(sectionId) {
    if (this._sections[sectionId]) {
      this._sections[sectionId].disabled = true
      return true
    }
    return false
  }

  enable(sectionId) {
    if (this._sections[sectionId]) {
      this._sections[sectionId].disabled = false
      return true
    }
    return false
  }

  pause() {
    this._pause = true
  }

  resume() {
    this._pause = false
  }

  // focus([silent])
  // focus(<sectionId>, [silent])
  // focus(<extSelector>, [silent])
  // Note: "silent" is optional and default to false
  focus(...args) {
    let [element, silent] = args
    if (typeof element === 'boolean' && silent === undefined) {
      silent = element
      element = undefined
    }

    const autoPause = !this._pause && silent

    if (autoPause)
      this.pause()

    let result
    if (element)
      if (typeof element === 'string') {
        result = this._sections[element]
          ? this._focusSection(element)
          : this._focusExtendedSelector(element)
      } else {
        const nextSectionId = this._getSectionId(element)
        if (this._isNavigable(element, nextSectionId))
          result = this._focusElement(element, nextSectionId)
      }
    else
      result = this._focusSection()

    if (autoPause)
      this.resume()

    return result
  }

  // move(<direction>)
  // move(<direction>, <selector>)
  move(dir, selector) {
    const direction = dir.toLowerCase()
    if (!getReverse(direction))
      return false

    const element = selector ? parseSelector(selector)[0] : this._getCurrentFocusedElement()
    if (!element)
      return false

    const sectionId = this._getSectionId(element)
    if (!sectionId)
      return false

    const willmoveProperties = {
      direction,
      sectionId,
      cause: 'api',
    }

    if (!this.fireEvent(element, 'willmove', willmoveProperties))
      return false

    return this._focusNext(direction, element, sectionId)
  }

  fireEvent(element, name, details, cancelable = true) {
    const type = `${this._config.eventPrefix}${name}`
    return EventsManager.fireEvent(element, type, details, cancelable)
  }

  addFocusable(config, onEnterPressHandler) {
    if (!config || this._getSectionId(document.getElementById(config.id)))
      return

    this.removeFocusable(config)

    const sectionId = this.add(config)

    if (onEnterPressHandler)
      this.addEventListener(config.selector, `${this._config.eventPrefix}enter-down`, onEnterPressHandler)

    this._makeFocusable(sectionId)
  }

  removeFocusable(config, onEnterPressHandler) {
    const sectionId = this._getSectionId(document.getElementById(config.id))
    if (!sectionId)
      return

    this.remove(sectionId)
    if (onEnterPressHandler)
      this.removeEventListener(`${this._config.eventPrefix}enter-down`, onEnterPressHandler)
  }

  setDefaultSection(sectionId) {
    if (sectionId)
      if (this._sections[sectionId])
        this._defaultSectionId = sectionId
      else
        throw new Error(`Section ${sectionId} doesn't exist!`)
    else
      this._defaultSectionId = ''
  }

  getCurrentFocusedPath() { return this._focusedPath }

  setCurrentFocusedPath(focusPath) {
    this._focusedPath = focusPath
    this.focus(focusPath)
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
      const tabIndexIgnoreList = section.tabIndexIgnoreList || this._config.tabIndexIgnoreList
      parseSelector(section.selector).forEach(element => {
        if (!matchSelector(element, tabIndexIgnoreList))
          if (!element.getAttribute('tabindex'))
            element.setAttribute('tabindex', '-1')
      })
    }

    if (sectionId)
      if (this._sections[sectionId])
        doMakeFocusable(this._sections[sectionId])
      else
        throw new Error(`Section ${sectionId} doesn't exist!`)
    else
      for (const id in this._sections)
        doMakeFocusable(this._sections[id])
  }

  _navigate(target, direction, candidates, config) {
    console.log('>>>>> _navigate', { target, direction, candidates, config })
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
    rects = rects.filter(rect => rect.element !== targetRect.element && isInsideAngle(rect, targetRect, direction))
    const prioritiesFunctions = direction => ({
      left: {
        group: rects,
        distance: [
          distanceFunction.leftIsBetter,
          // distanceFunction.nearHorizonIsBetter,
          // distanceFunction.nearestIsBetter,
          // distanceFunction.topIsBetter,
        ],
      },
      right: {
        group: rects,
        distance: [
          distanceFunction.rightIsBetter,
          // distanceFunction.nearHorizonIsBetter,
          // distanceFunction.nearestIsBetter,
          // distanceFunction.topIsBetter,
        ],
      },
      up: {
        group: rects,
        distance: [
          distanceFunction.topIsBetter,
          // distanceFunction.nearestIsBetter,
          // distanceFunction.nearHorizonIsBetter,
          // distanceFunction.leftIsBetter,
        ],
      },
      down: {
        group: rects,
        distance: [
          distanceFunction.bottomIsBetter,
          // distanceFunction.nearestIsBetter,
          // distanceFunction.nearPlumbLineIsBetter,
          // distanceFunction.topIsBetter,
          // distanceFunction.nearTargetLeftIsBetter,
        ],
      },
    })[direction]
    const priorities = prioritiesFunctions(direction)
    const destGroup = prioritize(priorities)
    console.log('>>>>> _navigate, destGroup: ', destGroup)
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

    if (!dest) {
      if (destGroup.length === 0)
        return
      dest = destGroup[0].element
    }

    return dest
  }

  _isNavigable(element, sectionId, verifySectionSelector) {
    if (!element || !sectionId || !this._sections[sectionId] || this._sections[sectionId].disabled)
      return false

    if ((element.offsetWidth <= 0 && element.offsetHeight <= 0) || element.hasAttribute('disabled'))
      return false

    if (verifySectionSelector && !matchSelector(element, this._sections[sectionId].selector))
      return false

    if (typeof this._sections[sectionId].navigableFilter === 'function') {
      if (this._sections[sectionId].navigableFilter(element, sectionId) === false)
        return false
    } else if (typeof this._config.navigableFilter === 'function') {
      if (this._config.navigableFilter(element, sectionId) === false)
        return false
    }
    return true
  }

  _focusNext(direction, currentFocusedElement, currentSectionId) {
    console.log('>>>>> _focusNext', { direction, currentFocusedElement, currentSectionId })
    const extSelector = currentFocusedElement.getAttribute(`data-sn-${direction}`)
    console.log('>>>>> _focusNext', { extSelector })
    if (typeof extSelector === 'string') {
      if (extSelector === ''
        || !this._focusExtendedSelector(extSelector, direction)) {
        this._fireNavigateFailed(currentFocusedElement, direction)
        return false
      }
      return true
    }

    const sectionNavigableElements = {}
    let allNavigableElements = []
    for (const id in this._sections) {
      sectionNavigableElements[id] = this._getSectionNavigableElements(id)
      allNavigableElements = allNavigableElements.concat(sectionNavigableElements[id])
    }

    const config = {
      ...this._config,
      ...this._sections[currentSectionId],
    }
    let next, candidates

    if (config.restrict === 'self-only' || config.restrict === 'self-first') {
      const currentSectionNavigableElements = sectionNavigableElements[currentSectionId]
      candidates = exclude(currentSectionNavigableElements, currentFocusedElement)
      next = this._navigate(currentFocusedElement, direction, candidates, config)

      if (!next && config.restrict === 'self-first') {
        candidates = exclude(allNavigableElements, currentSectionNavigableElements)
        next = this._navigate(currentFocusedElement, direction, candidates, config)
      }
    } else {
      candidates = exclude(allNavigableElements, currentFocusedElement)
      next = this._navigate(currentFocusedElement, direction, candidates, config)
    }

    console.log('>>>>> _focusNext', { candidates, next })

    if (next) {
      this._sections[currentSectionId].previous = {
        target: currentFocusedElement,
        destination: next,
        reverse: getReverse(direction),
      }

      const nextSectionId = this._getSectionId(next)

      if (currentSectionId !== nextSectionId) {
        const result = this._gotoLeaveFor(currentSectionId, direction)
        if (result) {
          return true
        } else if (result === null) {
          this._fireNavigateFailed(currentFocusedElement, direction)
          return false
        }

        let enterToElement
        switch (this._sections[nextSectionId].enterTo) {
        case 'last-focused':
          enterToElement = this._getSectionLastFocusedElement(nextSectionId)
          || this._getSectionDefaultElement(nextSectionId)
          break
        case 'default-element':
          enterToElement = this._getSectionDefaultElement(nextSectionId)
          break
        }
        if (enterToElement)
          next = enterToElement
      }
      return this._focusElement(next, nextSectionId, direction)
    } else if (this._gotoLeaveFor(currentSectionId, direction)) {
      return true
    }

    console.log('>>>>> _focusNext, _fireNavigateFailed', { currentFocusedElement, direction })
    this._fireNavigateFailed(currentFocusedElement, direction)
    return false
  }

  _focusChanged(element, sectionId) {
    const section = sectionId || this._getSectionId(element)

    if (section) {
      this._sections[section].lastFocusedElement = element
      this._lastSectionId = section
    }
  }

  _focusElement(element, sectionId, direction) {
    if (!element)
      return false

    const currentFocusedElement = this._getCurrentFocusedElement()

    const silentFocus = () => {
      if (currentFocusedElement)
        currentFocusedElement.blur()

      element.focus()
      this._focusChanged(element, sectionId)
    }

    if (this._duringFocusChange) {
      silentFocus()
      return true
    }

    this._duringFocusChange = true

    if (this._pause) {
      silentFocus()
      this._duringFocusChange = false
      return true
    }

    if (currentFocusedElement) {
      const unfocusProperties = {
        nextElement: element,
        nextSectionId: sectionId,
        direction,
        native: false,
      }
      if (!this.fireEvent(currentFocusedElement, 'willunfocus', unfocusProperties)) {
        this._duringFocusChange = false
        return false
      }
      currentFocusedElement.blur()
      this.fireEvent(currentFocusedElement, 'unfocused', unfocusProperties, false)
    }

    const focusProperties = {
      previousElement: currentFocusedElement,
      sectionId,
      direction,
      native: false,
    }

    if (!this.fireEvent(element, 'willfocus', focusProperties)) {
      this._duringFocusChange = false
      return false
    }

    element.focus()
    this.fireEvent(element, 'focused', focusProperties, false)

    this._duringFocusChange = false

    this._focusChanged(element, sectionId)
    return true
  }

  _focusSection(sectionId) {
    const range = []
    const addRange = id => {
      if (id && range.indexOf(id) < 0 && this._sections[id] && !this._sections[id].disabled)
        range.push(id)
    }

    if (sectionId) {
      addRange(sectionId)
    } else {
      addRange(this._defaultSectionId)
      addRange(this._lastSectionId)
      Object.keys(this._sections).map(addRange)
    }

    for (let i = 0; i < range.length; i++) {
      const id = range[i]
      let next

      if (this._sections[id].enterTo === 'last-focused')
        next = this._getSectionLastFocusedElement(id)
        || this._getSectionDefaultElement(id)
        || this._getSectionNavigableElements(id)[0]
      else
        next = this._getSectionDefaultElement(id)
        || this._getSectionLastFocusedElement(id)
        || this._getSectionNavigableElements(id)[0]

      if (next)
        return this._focusElement(next, id)
    }

    return false
  }

  _focusExtendedSelector(selector, direction) {
    if (selector.charAt(0) === '@') {
      if (selector.length === 1)
        return this._focusSection()
      const sectionId = selector.substr(1)
      return this._focusSection(sectionId)
    }
    const [next] = parseSelector(selector)
    if (next) {
      const nextSectionId = this._getSectionId(next)
      if (this._isNavigable(next, nextSectionId))
        return this._focusElement(next, nextSectionId, direction)
    }
    return false
  }

  _getSectionId(element) {
    for (const id in this._sections)
      if (!this._sections[id].disabled && element && matchSelector(element, this._sections[id].selector))
        return id
  }

  _getSectionNavigableElements(sectionId) {
    return parseSelector(this._sections[sectionId].selector).filter(element => this._isNavigable(element, sectionId))
  }

  _getSectionDefaultElement(sectionId) {
    let { defaultElement } = this._sections[sectionId]
    if (!defaultElement)
      return null

    if (typeof defaultElement === 'string')
      [defaultElement] = parseSelector(defaultElement)

    if (this._isNavigable(defaultElement, sectionId, true))
      return defaultElement

    return null
  }

  _getSectionLastFocusedElement(sectionId) {
    const lastFocusedElement = this._sections[sectionId] && this._sections[sectionId].lastFocusedElement
    if (!this._isNavigable(lastFocusedElement, sectionId, true))
      return null

    return lastFocusedElement
  }

  _getCurrentFocusedElement() {
    const { activeElement } = document
    if (activeElement && activeElement !== document.body)
      return activeElement
  }

  _fireNavigateFailed(element, direction) {
    return this.fireEvent(element, 'navigatefailed', { direction }, false)
  }

  _gotoLeaveFor(sectionId, direction) {
    if (this._sections[sectionId].leaveFor && this._sections[sectionId].leaveFor[direction] !== undefined) {
      const next = this._sections[sectionId].leaveFor[direction]

      if (typeof next === 'string') {
        if (next === '')
          return null

        return this._focusExtendedSelector(next, direction)
      }

      const nextSectionId = this._getSectionId(next)
      if (this._isNavigable(next, nextSectionId))
        return this._focusElement(next, nextSectionId, direction)
    }
    return false
  }

  _generateId() {
    let id
    do
      id = this._config.idPoolPrefix + String(++this._idPool)
    while (this._sections[id])
    return id
  }

  /**
   * Events
   */

  _onMouseOver = evt => {
    const { target } = evt
    if (!target || (!target.classList.contains('focusable') && !target.closest('.focusable')))
      return

    const element = target.classList.contains('focusable') ? target : target.closest('.focusable')

    this._focusElement(element, this._getSectionId(element))

    return preventDefault(evt)
  }

  _onMouseClickOrDown = evt => {
    const { target } = evt
    if (!target || (!target.classList.contains('focusable') && !target.closest('.focusable')))
      return

    const element = target.classList.contains('focusable') ? target : target.closest('.focusable')

    if (!this.fireEvent(element, 'enter-down'))
      return preventDefault(evt)
  }

  _onKeyDown = evt => {
    if (!this._sectionCount || this._pause || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)
      return

    let currentFocusedElement = this._getCurrentFocusedElement()
    let currentSectionId = this._getSectionId(currentFocusedElement)
    const keyMappping = getKeyMapping(evt.keyCode)

    if (!keyMappping)
      return

    if (keyMappping === 'enter')
      if (currentFocusedElement && currentSectionId)
        if (!this.fireEvent(currentFocusedElement, 'enter-down'))
          return preventDefault(evt)

    if (!currentFocusedElement) {
      if (this._lastSectionId)
        currentFocusedElement = this._getSectionLastFocusedElement(this._lastSectionId)

      if (currentFocusedElement) {
        this.focus(currentFocusedElement)
      } else {
        this._focusSection()
        return preventDefault(evt)
      }
    }

    currentSectionId = this._getSectionId(currentFocusedElement)
    if (!currentSectionId)
      return

    const willmoveProperties = {
      direction: keyMappping,
      sectionId: currentSectionId,
      cause: 'keydown',
    }

    if (this.fireEvent(currentFocusedElement, 'willmove', willmoveProperties))
      this._focusNext(keyMappping, currentFocusedElement, currentSectionId)

    return preventDefault(evt)
  }

  _onKeyUp = evt => {
    if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)
      return

    if (!this._pause && this._sectionCount && getKeyMapping(evt.keyCode) === 'center') {
      const currentFocusedElement = this._getCurrentFocusedElement()
      if (currentFocusedElement && this._getSectionId(currentFocusedElement))
        if (!this.fireEvent(currentFocusedElement, 'enter-up')) {
          preventDefault(evt)
        }
    }
  }

  _onFocus = evt => {
    const { target } = evt
    if (target !== window && target !== document && this._sectionCount && !this._duringFocusChange) {
      const sectionId = this._getSectionId(target)
      if (sectionId) {
        if (this._pause) {
          this._focusChanged(target, sectionId)
          return
        }

        const focusProperties = {
          sectionId,
          native: true,
        }

        const willfocusSuccess = this.fireEvent(target, 'willfocus', focusProperties)
        if (willfocusSuccess) {
          this.fireEvent(target, 'focused', focusProperties, false)
          this._focusChanged(target, sectionId)
        } else {
          this._duringFocusChange = true
          target.blur()
          this._duringFocusChange = false
        }
      }
    }
  }

  _onBlur = evt => {
    const { target } = evt
    if (target !== window
      && target !== document
      && !this._pause
      && this._sectionCount
      && !this._duringFocusChange
      && this._getSectionId(target)) {
      const unfocusProperties = { native: true }
      const willunfocusSuccess = this.fireEvent(target, 'willunfocus', unfocusProperties)
      if (willunfocusSuccess) {
        this.fireEvent(target, 'unfocused', unfocusProperties, false)
      } else {
        this._duringFocusChange = true
        setTimeout(() => {
          target.focus()
          this._duringFocusChange = false
        })
      }
    }
  }

  _handleFocused = event => {
    if (this._focusedPath !== event.detail.sectionId)
      this.setCurrentFocusedPath(event.detail.sectionId)
  }
}
