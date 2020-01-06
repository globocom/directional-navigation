/**
 * Copyright (c) 2019-present, Vitor Cavalcanti
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
 * Forked from luke-chang/js-spatial-navigation
 */

import MinkowskiDistance from './minkowski-distance'

const GlobalConfig = {
  selector: '',           // can be a valid <extSelector> except "@" syntax.
  straightOnly: false,
  straightOverlapThreshold: 0.35,
  rememberSource: false,
  disabled: false,
  defaultElement: '',     // <extSelector> except "@" syntax.
  enterTo: '',            // '', 'last-focused', 'default-element'
  leaveFor: null,         // {left: <extSelector>, right: <extSelector>, up: <extSelector>, down: <extSelector>}
  restrict: 'self-first', // 'self-first', 'self-only', 'none'
  tabIndexIgnoreList: [],
  navigableFilter: null,
}

/**
 * Constant Variable
 */
const KEYMAPPING = {
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
  195: 'enter',
}

const REVERSE = {
  left: 'right',
  up: 'down',
  right: 'left',
  down: 'up',
}

const EVENT_PREFIX = 'sn:'
const ID_POOL_PREFIX = 'section-'

/**
 * Private Variable
 */
let _idPool = 0
let _ready = false
let _pause = false
let _sections = {}
let _sectionCount = 0
let _defaultSectionId = ''
let _lastSectionId = ''
let _duringFocusChange = false

/**
 * Polyfill
 */
const elementMatchesSelector =
  Element.prototype.matches
  || Element.prototype.matchesSelector
  || Element.prototype.mozMatchesSelector
  || Element.prototype.webkitMatchesSelector
  || Element.prototype.msMatchesSelector
  || Element.prototype.oMatchesSelector
  || function(selector) {
    const matchedNodes = (this.parentNode || this.document).querySelectorAll(selector)
    return [].slice.call(matchedNodes).indexOf(this) >= 0
  }

/**
 * Core Function
 */
const getRect = element => {
  const cr = element.getBoundingClientRect()
  const rect = {
    left: cr.left,
    top: cr.top,
    right: cr.right,
    bottom: cr.bottom,
    width: cr.width,
    height: cr.height,
  }
  rect.element = element
  rect.center = {
    x: rect.left + Math.floor(rect.width / 2),
    y: rect.top + Math.floor(rect.height / 2),
  }
  rect.center.left = rect.center.x
  rect.center.right = rect.center.x
  rect.center.top = rect.center.y
  rect.center.bottom = rect.center.y
  return rect
}

const partition = (rects, targetRect, straightOverlapThreshold = GlobalConfig.straightOverlapThreshold) => {
  const groups = [[], [], [], [], [], [], [], [], []]

  rects.forEach(rect => {
    const { center } = rect
    let x, y

    if (center.x < targetRect.left)
      x = 0
    else if (center.x <= targetRect.right)
      x = 1
    else
      x = 2

    if (center.y < targetRect.top)
      y = 0
    else if (center.y <= targetRect.bottom)
      y = 1
    else
      y = 2

    const groupId = y * 3 + x
    groups[groupId].push(rect)

    if ([0, 2, 6, 8].indexOf(groupId) !== -1) {
      const threshold = straightOverlapThreshold

      if (rect.left <= targetRect.right - targetRect.width * threshold)
        if (groupId === 2)
          groups[1].push(rect)
        else if (groupId === 8)
          groups[7].push(rect)

      if (rect.right >= targetRect.left + targetRect.width * threshold)
        if (groupId === 0)
          groups[1].push(rect)
        else if (groupId === 6)
          groups[7].push(rect)

      if (rect.top <= targetRect.bottom - targetRect.height * threshold)
        if (groupId === 6)
          groups[3].push(rect)
        else if (groupId === 8)
          groups[5].push(rect)

      if (rect.bottom >= targetRect.top + targetRect.height * threshold)
        if (groupId === 0)
          groups[3].push(rect)
        else if (groupId === 2)
          groups[5].push(rect)
    }
  })

  return groups
}

const generateDistanceFunction = fromRect => ({
  nearestIsBetter: toRect => {
    const targetXY = [fromRect.center.x, fromRect.center.y]
    const d = MinkowskiDistance.calculate(targetXY, [toRect.center.x, toRect.center.y])
    // console.log('>>>> nearestIsBetter ', toRect.element.id, d)
    return d
  },
  nearPlumbLineIsBetter: toRect => {
    let d
    if (toRect.center.x < fromRect.center.x)
      d = fromRect.center.x - toRect.right
    else
      d = toRect.left - fromRect.center.x
    // console.log('>>>> nearPlumbLineIsBetter ', toRect.element.id, d)
    return d < 0 ? 0 : d
  },
  nearHorizonIsBetter: toRect => {
    let d
    if (toRect.center.y < fromRect.center.y)
      d = fromRect.center.y - toRect.bottom
    else
      d = toRect.top - fromRect.center.y
    // console.log('>>>> nearHorizonIsBetter ', toRect.element.id, d)
    return d < 0 ? 0 : d
  },
  nearTargetLeftIsBetter: toRect => {
    let d
    if (toRect.center.x < fromRect.center.x)
      d = fromRect.left - toRect.right
    else
      d = toRect.left - fromRect.left
    // console.log('>>>> nearTargetLeftIsBetter ', toRect.element.id, d)
    return d < 0 ? 0 : d
  },
  nearTargetTopIsBetter: toRect => {
    let d
    if (toRect.center.y < fromRect.center.y)
      d = fromRect.top - toRect.bottom
    else
      d = toRect.top - fromRect.top
    // console.log('>>>> nearTargetTopIsBetter ', toRect.element.id, d)
    return d < 0 ? 0 : d
  },
  topIsBetter: toRect => toRect.top,
  bottomIsBetter: toRect => -1 * toRect.bottom,
  leftIsBetter: toRect => toRect.left,
  rightIsBetter: toRect => -1 * toRect.right,
})

const prioritize = priorities => {
  let destPriority

  for (let i = 0; i < priorities.length; i++)
    if (priorities[i].group.length) {
      destPriority = priorities[i]
      break
    }

  if (!destPriority)
    return null

  const destDistance = destPriority.distance

  destPriority.group.sort((a, b) => {
    for (let i = 0; i < destDistance.length; i++) {
      const distance = destDistance[i]
      const delta = distance(a) - distance(b)
      if (delta)
        return delta
    }
    return 0
  })

  return destPriority.group
}

const navigate = (target, direction, candidates, config) => {
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

  // dest = rects && rects.length && rects[0].element
  // console.log('>>> dest ', dest)

  return dest
}

/**
 * Private Function
 */
const generateId = () => {
  let id
  do
    id = ID_POOL_PREFIX + String(++_idPool)
  while (_sections[id])
  return id
}

const parseSelector = selector => {
  let result
  if (typeof selector === 'string')
    result = [].slice.call(document.querySelectorAll(selector))
  else if (typeof selector === 'object' && selector.length)
    result = [].slice.call(selector)
  else if (typeof selector === 'object' && selector.nodeType === 1)
    result = [selector]
  else
    result = []
  return result
}

const matchSelector = (element, selector) => {
  if (typeof selector === 'string')
    return elementMatchesSelector.call(element, selector)
  else if (typeof selector === 'object' && selector.length)
    return selector.indexOf(element) >= 0
  else if (typeof selector === 'object' && selector.nodeType === 1)
    return element === selector
  return false
}

const getCurrentFocusedElement = () => {
  const { activeElement } = document
  if (activeElement && activeElement !== document.body)
    return activeElement
}

const extend = (config, ...args) => {
  const out = config || {}
  for (let i = 1; i < args.length; i++) {
    if (!args[i])
      continue
    for (const key in args[i])
      if (Object.prototype.hasOwnProperty.call(args[i], key) && args[i][key] !== undefined)
        out[key] = args[i][key]
  }
  return out
}

const exclude = (elemList, excludedElem) => {
  for (const element in Array.from(excludedElem)) {
    const index = elemList.indexOf(element)
    if (index >= 0)
      elemList.splice(index, 1)
  }
  return elemList
}

const isNavigable = (element, sectionId, verifySectionSelector) => {
  if (!element || !sectionId || !_sections[sectionId] || _sections[sectionId].disabled)
    return false

  if ((element.offsetWidth <= 0 && element.offsetHeight <= 0) || element.hasAttribute('disabled'))
    return false

  if (verifySectionSelector && !matchSelector(element, _sections[sectionId].selector))
    return false

  if (typeof _sections[sectionId].navigableFilter === 'function') {
    if (_sections[sectionId].navigableFilter(element, sectionId) === false)
      return false
  } else if (typeof GlobalConfig.navigableFilter === 'function') {
    if (GlobalConfig.navigableFilter(element, sectionId) === false)
      return false
  }
  return true
}

const getSectionId = element => {
  for (const id in _sections)
    if (!_sections[id].disabled && element && matchSelector(element, _sections[id].selector))
      return id
}

const getSectionNavigableElements = sectionId => parseSelector(_sections[sectionId].selector).filter(element => isNavigable(element, sectionId))

const getSectionDefaultElement = sectionId => {
  let { defaultElement } = _sections[sectionId]
  if (!defaultElement)
    return null

  if (typeof defaultElement === 'string')
    [defaultElement] = parseSelector(defaultElement)

  if (isNavigable(defaultElement, sectionId, true))
    return defaultElement

  return null
}

const getSectionLastFocusedElement = sectionId => {
  const lastFocusedElement = _sections[sectionId] && _sections[sectionId].lastFocusedElement
  if (!isNavigable(lastFocusedElement, sectionId, true))
    return null

  return lastFocusedElement
}

const fireEvent = (element, type, details, cancelable = true) => {
  const evt = document.createEvent('CustomEvent')
  evt.initCustomEvent(EVENT_PREFIX + type, true, cancelable, details)
  return element.dispatchEvent(evt)
}

const focusChanged = (element, sectionId) => {
  const section = sectionId || getSectionId(element)

  if (section) {
    _sections[section].lastFocusedElement = element
    _lastSectionId = section
  }
}

const focusElement = (element, sectionId, direction) => {
  if (!element)
    return false

  const currentFocusedElement = getCurrentFocusedElement()

  const silentFocus = () => {
    if (currentFocusedElement)
      currentFocusedElement.blur()

    element.focus()
    focusChanged(element, sectionId)
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
    if (!fireEvent(currentFocusedElement, 'willunfocus', unfocusProperties)) {
      _duringFocusChange = false
      return false
    }
    currentFocusedElement.blur()
    fireEvent(currentFocusedElement, 'unfocused', unfocusProperties, false)
  }

  const focusProperties = {
    previousElement: currentFocusedElement,
    sectionId,
    direction,
    native: false,
  }

  if (!fireEvent(element, 'willfocus', focusProperties)) {
    _duringFocusChange = false
    return false
  }

  element.focus()
  fireEvent(element, 'focused', focusProperties, false)

  _duringFocusChange = false

  focusChanged(element, sectionId)
  return true
}

const focusSection = sectionId => {
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
      next = getSectionLastFocusedElement(id) || getSectionDefaultElement(id) || getSectionNavigableElements(id)[0]
    else
      next = getSectionDefaultElement(id) || getSectionLastFocusedElement(id) || getSectionNavigableElements(id)[0]

    if (next)
      return focusElement(next, id)
  }

  return false
}

const focusExtendedSelector = (selector, direction) => {
  if (selector.charAt(0) === '@') {
    if (selector.length === 1)
      return focusSection()
    const sectionId = selector.substr(1)
    return focusSection(sectionId)
  }
  const [next] = parseSelector(selector)
  if (next) {
    const nextSectionId = getSectionId(next)
    if (isNavigable(next, nextSectionId))
      return focusElement(next, nextSectionId, direction)
  }
  return false
}

const fireNavigateFailed = (element, direction) => fireEvent(element, 'navigatefailed', { direction }, false)

const gotoLeaveFor = (sectionId, direction) => {
  if (_sections[sectionId].leaveFor && _sections[sectionId].leaveFor[direction] !== undefined) {
    const next = _sections[sectionId].leaveFor[direction]

    if (typeof next === 'string') {
      if (next === '')
        return null

      return focusExtendedSelector(next, direction)
    }

    const nextSectionId = getSectionId(next)
    if (isNavigable(next, nextSectionId))
      return focusElement(next, nextSectionId, direction)
  }
  return false
}

const focusNext = (direction, currentFocusedElement, currentSectionId) => {
  const extSelector = currentFocusedElement.getAttribute(`data-sn-${direction}`)
  if (typeof extSelector === 'string') {
    if (extSelector === ''
      || !focusExtendedSelector(extSelector, direction)) {
      fireNavigateFailed(currentFocusedElement, direction)
      return false
    }
    return true
  }

  const sectionNavigableElements = {}
  let allNavigableElements = []
  for (const id in _sections) {
    sectionNavigableElements[id] = getSectionNavigableElements(id)
    allNavigableElements = allNavigableElements.concat(sectionNavigableElements[id])
  }

  const config = extend({}, GlobalConfig, _sections[currentSectionId])
  let next, candidates

  if (config.restrict === 'self-only' || config.restrict === 'self-first') {
    const currentSectionNavigableElements = sectionNavigableElements[currentSectionId]
    candidates = exclude(currentSectionNavigableElements, currentFocusedElement)
    next = navigate(currentFocusedElement, direction, candidates, config)

    if (!next && config.restrict === 'self-first') {
      candidates = exclude(allNavigableElements, currentSectionNavigableElements)
      next = navigate(currentFocusedElement, direction, candidates, config)
    }
  } else {
    candidates = exclude(allNavigableElements, currentFocusedElement)
    next = navigate(currentFocusedElement, direction, candidates, config)
  }

  if (next) {
    _sections[currentSectionId].previous = {
      target: currentFocusedElement,
      destination: next,
      reverse: REVERSE[direction],
    }

    const nextSectionId = getSectionId(next)

    if (currentSectionId !== nextSectionId) {
      const result = gotoLeaveFor(currentSectionId, direction)
      if (result) {
        return true
      } else if (result === null) {
        fireNavigateFailed(currentFocusedElement, direction)
        return false
      }

      let enterToElement
      switch (_sections[nextSectionId].enterTo) {
      case 'last-focused':
        enterToElement = getSectionLastFocusedElement(nextSectionId) || getSectionDefaultElement(nextSectionId)
        break
      case 'default-element':
        enterToElement = getSectionDefaultElement(nextSectionId)
        break
      }
      if (enterToElement)
        next = enterToElement
    }
    return focusElement(next, nextSectionId, direction)
  } else if (gotoLeaveFor(currentSectionId, direction)) {
    return true
  }

  fireNavigateFailed(currentFocusedElement, direction)
  return false
}

const preventDefault = evt => {
  evt.preventDefault()
  evt.stopPropagation()
  return false
}

const onMouseOver = evt => {
  const { target } = evt
  if (!target || (!target.classList.contains('focusable') && !target.closest('.focusable')))
    return

  const element = target.classList.contains('focusable') ? target : target.closest('.focusable')

  focusElement(element, getSectionId(element))

  return preventDefault(evt)
}

const onMouseDown = evt => {
  const { target } = evt
  if (!target || (!target.classList.contains('focusable') && !target.closest('.focusable')))
    return

  const element = target.classList.contains('focusable') ? target : target.closest('.focusable')

  if (!fireEvent(element, 'enter-down'))
    return preventDefault(evt)
}

const onKeyDown = evt => {
  if (!_sectionCount || _pause || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)
    return

  let currentFocusedElement = getCurrentFocusedElement()
  const currentSectionId = getSectionId(currentFocusedElement)
  const keyMappping = KEYMAPPING[evt.keyCode]

  if (!keyMappping)
    return

  if (keyMappping === 'enter')
    if (currentFocusedElement && currentSectionId)
      if (!fireEvent(currentFocusedElement, 'enter-down'))
        return preventDefault(evt)

  if (!currentFocusedElement) {
    if (_lastSectionId)
      currentFocusedElement = getSectionLastFocusedElement(_lastSectionId)

    if (!currentFocusedElement) {
      focusSection()
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

  if (fireEvent(currentFocusedElement, 'willmove', willmoveProperties))
    focusNext(keyMappping, currentFocusedElement, currentSectionId)

  return preventDefault(evt)
}

const onKeyUp = evt => {
  if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)
    return

  if (!_pause && _sectionCount && KEYMAPPING[evt.keyCode] === 'center') {
    const currentFocusedElement = getCurrentFocusedElement()
    if (currentFocusedElement && getSectionId(currentFocusedElement))
      if (!fireEvent(currentFocusedElement, 'enter-up')) {
        preventDefault(evt)
      }
  }
}

const onFocus = evt => {
  const { target } = evt
  if (target !== window && target !== document && _sectionCount && !_duringFocusChange) {
    const sectionId = getSectionId(target)
    if (sectionId) {
      if (_pause) {
        focusChanged(target, sectionId)
        return
      }

      const focusProperties = {
        sectionId,
        native: true,
      }

      const willfocusSuccess = fireEvent(target, 'willfocus', focusProperties)
      if (willfocusSuccess) {
        fireEvent(target, 'focused', focusProperties, false)
        focusChanged(target, sectionId)
      } else {
        _duringFocusChange = true
        target.blur()
        _duringFocusChange = false
      }
    }
  }
}

const onBlur = evt => {
  const { target } = evt
  if (target !== window
    && target !== document
    && !_pause
    && _sectionCount
    && !_duringFocusChange
    && getSectionId(target)) {
    const unfocusProperties = { native: true }
    const willunfocusSuccess = fireEvent(target, 'willunfocus', unfocusProperties)
    if (willunfocusSuccess) {
      fireEvent(target, 'unfocused', unfocusProperties, false)
    } else {
      _duringFocusChange = true
      setTimeout(() => {
        target.focus()
        _duringFocusChange = false
      })
    }
  }
}

/**
 * Public Function
 */
const Navigation = {
  init: () => {
    if (!_ready) {
      window.addEventListener('mouseover', onMouseOver)
      window.addEventListener('mousedown', onMouseDown)
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('focus', onFocus, true)
      window.addEventListener('blur', onBlur, true)
      _ready = true
    }
  },

  uninit: () => {
    window.removeEventListener('mouseover', onMouseOver)
    window.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('blur', onBlur, true)
    window.removeEventListener('focus', onFocus, true)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('keydown', onKeyDown)
    Navigation.clear()
    _idPool = 0
    _ready = false
  },

  clear: () => {
    _sections = {}
    _sectionCount = 0
    _defaultSectionId = ''
    _lastSectionId = ''
    _duringFocusChange = false
  },

  // set(<config>)
  // set(<sectionId>, <config>)
  set: (...args) => {
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
      if (GlobalConfig[key] !== undefined)
        if (sectionId)
          _sections[sectionId][key] = config[key]
        else if (config[key] !== undefined)
          GlobalConfig[key] = config[key]
  },

  // add(<config>)
  // add(<sectionId>, <config>)
  add: (...args) => {
    let sectionId, config

    if (typeof args[0] === 'object')
      [config] = args
    else if (typeof args[0] === 'string' && typeof args[1] === 'object')
      [sectionId, config] = args

    if (!sectionId)
      sectionId = typeof config.id === 'string' ? config.id : generateId()

    if (_sections[sectionId])
      throw new Error(`Section ${sectionId} has already existed!`)

    _sections[sectionId] = {}
    _sectionCount++

    Navigation.set(sectionId, config)

    return sectionId
  },

  remove: sectionId => {
    if (!sectionId || typeof sectionId !== 'string')
      throw new Error('Please assign the "sectionId"!')

    if (_sections[sectionId]) {
      _sections[sectionId] = undefined
      _sections = extend({}, _sections)
      _sectionCount--
      return true
    }
    return false
  },

  disable: sectionId => {
    if (_sections[sectionId]) {
      _sections[sectionId].disabled = true
      return true
    }
    return false
  },

  enable: sectionId => {
    if (_sections[sectionId]) {
      _sections[sectionId].disabled = false
      return true
    }
    return false
  },

  pause: () => {
    _pause = true
  },

  resume: () => {
    _pause = false
  },

  // focus([silent])
  // focus(<sectionId>, [silent])
  // focus(<extSelector>, [silent])
  // Note: "silent" is optional and default to false
  focus: (...args) => {
    let [element, silent] = args
    if (typeof element === 'boolean' && silent === undefined) {
      silent = element
      element = undefined
    }

    const autoPause = !_pause && silent

    if (autoPause)
      Navigation.pause()

    let result
    if (element)
      if (typeof element === 'string') {
        result = _sections[element]
          ? focusSection(element)
          : focusExtendedSelector(element)
      } else {
        const nextSectionId = getSectionId(element)
        if (isNavigable(element, nextSectionId))
          result = focusElement(element, nextSectionId)
      }
    else
      result = focusSection()

    if (autoPause)
      Navigation.resume()

    return result
  },

  // move(<direction>)
  // move(<direction>, <selector>)
  move: (dir, selector) => {
    const direction = dir.toLowerCase()
    if (!REVERSE[direction])
      return false

    const element = selector ? parseSelector(selector)[0] : getCurrentFocusedElement()
    if (!element)
      return false

    const sectionId = getSectionId(element)
    if (!sectionId)
      return false

    const willmoveProperties = {
      direction,
      sectionId,
      cause: 'api',
    }

    if (!fireEvent(element, 'willmove', willmoveProperties))
      return false

    return focusNext(direction, element, sectionId)
  },

  // makeFocusable()
  // makeFocusable(<sectionId>)
  makeFocusable: sectionId => {
    const doMakeFocusable = section => {
      const tabIndexIgnoreList = section.tabIndexIgnoreList || GlobalConfig.tabIndexIgnoreList
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
  },

  setDefaultSection: sectionId => {
    if (sectionId)
      if (_sections[sectionId])
        _defaultSectionId = sectionId
      else
        throw new Error(`Section ${sectionId} doesn't exist!`)
    else
      _defaultSectionId = ''
  },

  getSectionId,
}

export default Navigation
