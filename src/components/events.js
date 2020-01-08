export default class EventsManager {
  constructor(eventPrefix) {
    this._eventPrefix = eventPrefix
  }

  addListener(target, event, handler, capture = false) {
    if (typeof target === 'string')
      document.querySelectorAll(target).forEach(elem => elem.addEventListener(event, handler, capture))
    target.addEventListener(event, handler, capture)
  }

  removeListener(target, event, handler, capture = false) {
    if (typeof target === 'string')
      document.querySelectorAll(target).forEach(elem => elem.removeEventListener(event, handler, capture))
    target.removeEventListener(event, handler, capture)
  }

  fireEvent(element, type, details, cancelable = true) {
    const evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(this._eventPrefix + type, true, cancelable, details)
    return element.dispatchEvent(evt)
  }
}
