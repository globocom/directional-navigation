
export default class EventsManager {
  static addListener(target, event, handler, capture = false) {
    if (typeof target === 'string') {
      const elems = document.querySelectorAll(target)
      if (elems && elems.length > 0)
        for (let i = 0; i < elems.length; i++)
          elems[i].addEventListener(event, handler, capture)
    } else {
      target.addEventListener(event, handler, capture)
    }
  }

  static removeListener(target, event, handler, capture = false) {
    if (typeof target === 'string') {
      const elems = document.querySelectorAll(target)
      if (elems && elems.length > 0)
        for (let i = 0; i < elems.length; i++)
          elems[i].removeEventListener(event, handler, capture)
    } else {
      target.removeEventListener(event, handler, capture)
    }
  }

  static fireEvent(element, type, details, cancelable = true) {
    const evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(type, true, cancelable, details)
    return element.dispatchEvent(evt)
  }
}
