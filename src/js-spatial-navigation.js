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
const getRect = elem => {
  const cr = elem.getBoundingClientRect()
  const rect = {
    left: cr.left,
    top: cr.top,
    right: cr.right,
    bottom: cr.bottom,
    width: cr.width,
    height: cr.height,
  }
  rect.element = elem
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

const partition = (rects, targetRect, straightOverlapThreshold) => {
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

const generateDistanceFunction = targetRect => ({
  nearPlumbLineIsBetter: rect => {
    let d
    if (rect.center.x < targetRect.center.x)
      d = targetRect.center.x - rect.right
    else
      d = rect.left - targetRect.center.x
    return d < 0 ? 0 : d
  },
  nearHorizonIsBetter: rect => {
    let d
    if (rect.center.y < targetRect.center.y)
      d = targetRect.center.y - rect.bottom
    else
      d = rect.top - targetRect.center.y
    return d < 0 ? 0 : d
  },
  nearTargetLeftIsBetter: rect => {
    let d
    if (rect.center.x < targetRect.center.x)
      d = targetRect.left - rect.right
    else
      d = rect.left - targetRect.left
    return d < 0 ? 0 : d
  },
  nearTargetTopIsBetter: rect => {
    let d
    if (rect.center.y < targetRect.center.y)
      d = targetRect.top - rect.bottom
    else
      d = rect.top - targetRect.top
    return d < 0 ? 0 : d
  },
  topIsBetter: rect => rect.top,
  bottomIsBetter: rect => -1 * rect.bottom,
  leftIsBetter: rect => rect.left,
  rightIsBetter: rect => -1 * rect.right,
})

const prioritize = priorities => {
  let destPriority
  for (const priority in priorities)
    if (priority.group.length) {
      destPriority = priority
      break
    }

  if (!destPriority)
    return null

  destPriority.group.sort((a, b) => {
    destPriority.distance.forEach(distance => {
      const delta = distance(a) - distance(b)
      if (delta)
        return delta
    })
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

  let rects
  candidates.forEach(candidate => {
    const rect = getRect(candidate)
    if (rect)
      rects.push(rect)
  })

  if (!rects.length)
    return null

  const { targetX, targetY } = targetRect.center
  rects.sort((a, b) => {
    const distanceToA = MinkowskiDistance.calculate([targetX, targetY], [a.center.x, a.center.y])
    const distanceToB = MinkowskiDistance.calculate([targetX, targetY], [b.center.x, b.center.y])
    return distanceToA > distanceToB ? 1 : -1
  })

  const distanceFunction = generateDistanceFunction(targetRect)

  // var groups = partition(
  //   rects,
  //   targetRect,
  //   config.straightOverlapThreshold
  // )

  // var internalGroups = partition(
  //   groups[4],
  //   targetRect.center,
  //   config.straightOverlapThreshold
  // )

  let priorities

  switch (direction) {
  case 'left':
    rects = rects.filter(elem => elem.center.x < targetRect.center.x)
    priorities = [
      {
        // group: internalGroups[0].concat(internalGroups[3])
        //                          .concat(internalGroups[6]),
        group: rects,
        distance: [
          distanceFunction.nearPlumbLineIsBetter,
          distanceFunction.topIsBetter,
        ],
      },
      // {
      //   group: groups[3],
      //   distance: [
      //     distanceFunction.nearPlumbLineIsBetter,
      //     distanceFunction.topIsBetter
      //   ]
      // },
      {
        // group: groups[0].concat(groups[6]),
        group: rects,
        distance: [
          distanceFunction.nearHorizonIsBetter,
          distanceFunction.rightIsBetter,
          distanceFunction.nearTargetTopIsBetter,
        ],
      },
    ]
    break
  case 'right':
    rects = rects.filter(elem => elem.center.x > targetRect.center.x)
    priorities = [
      {
        // group: internalGroups[2].concat(internalGroups[5])
        //                          .concat(internalGroups[8]),
        group: rects,
        distance: [
          distanceFunction.nearPlumbLineIsBetter,
          distanceFunction.topIsBetter,
        ],
      },
      // {
      //   group: groups[5],
      //   distance: [
      //     distanceFunction.nearPlumbLineIsBetter,
      //     distanceFunction.topIsBetter
      //   ]
      // },
      {
        // group: groups[2].concat(groups[8]),
        group: rects,
        distance: [
          distanceFunction.nearHorizonIsBetter,
          distanceFunction.leftIsBetter,
          distanceFunction.nearTargetTopIsBetter,
        ],
      },
    ]
    break
  case 'up':
    rects = rects.filter(elem => elem.center.y < targetRect.center.y)
    priorities = [
      {
        // group: internalGroups[0].concat(internalGroups[1])
        //                          .concat(internalGroups[2]),
        group: rects,
        distance: [
          distanceFunction.nearHorizonIsBetter,
          distanceFunction.leftIsBetter,
        ],
      },
      // {
      //   group: groups[1],
      //   distance: [
      //     distanceFunction.nearHorizonIsBetter,
      //     distanceFunction.leftIsBetter
      //   ]
      // },
      {
        // group: groups[0].concat(groups[2]),
        group: rects,
        distance: [
          distanceFunction.nearPlumbLineIsBetter,
          distanceFunction.bottomIsBetter,
          distanceFunction.nearTargetLeftIsBetter,
        ],
      },
    ]
    break
  case 'down':
    rects = rects.filter(elem => elem.center.y > targetRect.center.y)
    priorities = [
      {
      //   // group: internalGroups[6].concat(internalGroups[7])
      //   //                          .concat(internalGroups[8]),
      //   group: rects,
      //   distance: [
      //     distanceFunction.nearHorizonIsBetter,
      //     distanceFunction.leftIsBetter
      //   ]
      // },
      // {
      //   group: groups[7],
      //   distance: [
      //     distanceFunction.nearHorizonIsBetter,
      //     distanceFunction.leftIsBetter
      //   ]
      // },
      // {
        // group: groups[6].concat(groups[8]),
        group: rects,
        distance: [
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

const matchSelector = (elem, selector) => {
  if (typeof selector === 'string')
    return elementMatchesSelector.call(elem, selector)
  else if (typeof selector === 'object' && selector.length)
    return selector.indexOf(elem) >= 0
  else if (typeof selector === 'object' && selector.nodeType === 1)
    return elem === selector
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

const isNavigable = (elem, sectionId, verifySectionSelector) => {
  if (!elem || !sectionId || !_sections[sectionId] || _sections[sectionId].disabled)
    return false

  if ((elem.offsetWidth <= 0 && elem.offsetHeight <= 0) || elem.hasAttribute('disabled'))
    return false

  if (verifySectionSelector && !matchSelector(elem, _sections[sectionId].selector))
    return false

  if (typeof _sections[sectionId].navigableFilter === 'function') {
    if (_sections[sectionId].navigableFilter(elem, sectionId) === false)
      return false
  } else if (typeof GlobalConfig.navigableFilter === 'function') {
    if (GlobalConfig.navigableFilter(elem, sectionId) === false)
      return false
  }
  return true
}

const getSectionId = elem => {
  for (const id in _sections)
    if (!_sections[id].disabled && elem && matchSelector(elem, _sections[id].selector))
      return id
}

const getSectionNavigableElements = sectionId => {
  parseSelector(_sections[sectionId].selector).filter(elem => isNavigable(elem, sectionId))
}

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

const fireEvent = (elem, type, details, cancelable = true) => {
  const evt = document.createEvent('CustomEvent')
  evt.initCustomEvent(EVENT_PREFIX + type, true, cancelable, details)
  return elem.dispatchEvent(evt)
}

const focusChanged = (elem, sectionId) => {
  const section = sectionId || getSectionId(elem)

  if (section) {
    _sections[section].lastFocusedElement = elem
    _lastSectionId = section
  }
}

const focusElement = (elem, sectionId, direction) => {
  if (!elem)
    return false

  const currentFocusedElement = getCurrentFocusedElement()

  const silentFocus = () => {
    if (currentFocusedElement)
      currentFocusedElement.blur()

    elem.focus()
    focusChanged(elem, sectionId)
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
      nextElement: elem,
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

  if (!fireEvent(elem, 'willfocus', focusProperties)) {
    _duringFocusChange = false
    return false
  }

  elem.focus()
  fireEvent(elem, 'focused', focusProperties, false)

  _duringFocusChange = false

  focusChanged(elem, sectionId)
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

  for (const id in range) {
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
    if (selector.length === 1) {
      return focusSection()
    } else {
      const sectionId = selector.substr(1)
      return focusSection(sectionId)
    }
  } else {
    const [next] = parseSelector(selector)
    if (next) {
      const nextSectionId = getSectionId(next)
      if (isNavigable(next, nextSectionId))
        return focusElement(next, nextSectionId, direction)
    }
  }
  return false
}

const fireNavigateFailed = (elem, direction) => fireEvent(elem, 'navigatefailed', { direction }, false)

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

const onKeyDown = evt => {
  console.log('>>>> onKeyDown ', KEYMAPPING[evt.keyCode])
  if (!_sectionCount || _pause || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)
    return

  const preventDefault = () => {
    evt.preventDefault()
    evt.stopPropagation()
    return false
  }

  let currentFocusedElement = getCurrentFocusedElement()
  const currentSectionId = getSectionId(currentFocusedElement)
  const keyMappping = KEYMAPPING[evt.keyCode]

  if (!keyMappping)
    return

  if (keyMappping === 'enter')
    if (currentFocusedElement && currentSectionId)
      if (!fireEvent(currentFocusedElement, 'enter-down'))
        return preventDefault()

  if (!currentFocusedElement) {
    if (_lastSectionId)
      currentFocusedElement = getSectionLastFocusedElement(_lastSectionId)

    if (!currentFocusedElement) {
      focusSection()
      return preventDefault()
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

  return preventDefault()
}

const onKeyUp = evt => {
  console.log('>>>> onKeyUp ', KEYMAPPING[evt.keyCode])
  if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)
    return

  if (!_pause && _sectionCount && KEYMAPPING[evt.keyCode] === 'center') {
    const currentFocusedElement = getCurrentFocusedElement()
    if (currentFocusedElement && getSectionId(currentFocusedElement))
      if (!fireEvent(currentFocusedElement, 'enter-up')) {
        evt.preventDefault()
        evt.stopPropagation()
      }
  }
}

const onFocus = evt => {
  console.log('>>>> onFocus ', KEYMAPPING[evt.keyCode])
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

      if (!fireEvent(target, 'willfocus', focusProperties)) {
        _duringFocusChange = true
        target.blur()
        _duringFocusChange = false
      } else {
        fireEvent(target, 'focused', focusProperties, false)
        focusChanged(target, sectionId)
      }
    }
  }
}

const onBlur = evt => {
  console.log('>>>> onBlur ', KEYMAPPING[evt.keyCode])
  const { target } = evt
  if (target !== window
    && target !== document
    && !_pause
    && _sectionCount
    && !_duringFocusChange
    && getSectionId(target)) {
    const unfocusProperties = { native: true }
    if (!fireEvent(target, 'willunfocus', unfocusProperties)) {
      _duringFocusChange = true
      setTimeout(() => {
        target.focus()
        _duringFocusChange = false
      })
    } else {
      fireEvent(target, 'unfocused', unfocusProperties, false)
    }
  }
}

/**
 * Public Function
 */
const Navigation = {
  init: () => {
    if (!_ready) {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('focus', onFocus, true)
      window.addEventListener('blur', onBlur, true)
      _ready = true
    }
  },

  uninit: () => {
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

    if (sectionId)
      _sections[sectionId] = extend({}, _sections[sectionId])
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
  focus: (elem, silent) => {
    if (silent === undefined && typeof elem === 'boolean') {
      silent = elem
      elem = undefined
    }

    const autoPause = !_pause && silent

    if (autoPause)
      Navigation.pause()

    let result
    if (elem) {
      if (typeof elem === 'string') {
        if (_sections[elem])
          result = focusSection(elem)
        else
          result = focusExtendedSelector(elem)
      } else {
        const nextSectionId = getSectionId(elem)
        if (isNavigable(elem, nextSectionId))
          result = focusElement(elem, nextSectionId)
      }
    } else {
      result = focusSection()
    }

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

    const elem = selector ? parseSelector(selector)[0] : getCurrentFocusedElement()
    if (!elem)
      return false

    const sectionId = getSectionId(elem)
    if (!sectionId)
      return false

    const willmoveProperties = {
      direction,
      sectionId,
      cause: 'api',
    }

    if (!fireEvent(elem, 'willmove', willmoveProperties))
      return false

    return focusNext(direction, elem, sectionId)
  },

  // makeFocusable()
  // makeFocusable(<sectionId>)
  makeFocusable: sectionId => {
    const doMakeFocusable = section => {
      const tabIndexIgnoreList = section.tabIndexIgnoreList || GlobalConfig.tabIndexIgnoreList
      parseSelector(section.selector).forEach(elem => {
        if (!matchSelector(elem, tabIndexIgnoreList))
          if (!elem.getAttribute('tabindex'))
            elem.setAttribute('tabindex', '-1')
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
    if (!sectionId)
      _defaultSectionId = ''
    else if (!_sections[sectionId])
      throw new Error(`Section ${sectionId} doesn't exist!`)
    else
      _defaultSectionId = sectionId
  },

  getSectionId,
}

export default Navigation
