export default class EventsManager {
  static addListener(target, event, handler, capture = false) {
    target.addEventListener(event, handler, capture)
  }

  static removeListener(target, event, handler, capture = false) {
    target.removeEventListener(event, handler, capture)
  }

  static fireEvent() { }
}
