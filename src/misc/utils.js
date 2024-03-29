import { KeyName } from '../constants'

export const preventDefault = evt => {
  evt.preventDefault()
  evt.stopPropagation()
  return false
}

export const parseSelector = selector => {
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

export const matchSelector = (element, selector) => {
  if (typeof selector === 'string')
    return element.matches(selector)
  else if (typeof selector === 'object' && selector.length)
    return selector.indexOf(element) >= 0
  else if (typeof selector === 'object' && selector.nodeType === 1)
    return element === selector
  return false
}

export const exclude = (elemList, excludedElem) => {
  const arr = new Array(excludedElem)
  for (const element in arr) {
    const index = elemList.indexOf(element)
    if (index >= 0)
      elemList.splice(index, 1)
  }
  return elemList
}

export const getReverse = direction => (
  {
    [KeyName.LEFT]: KeyName.RIGHT,
    [KeyName.UP]: KeyName.DOWN,
    [KeyName.RIGHT]: KeyName.LEFT,
    [KeyName.DOWN]: KeyName.UP,
  }[direction]
)
