if (!Element.prototype.matches)
  Element.prototype.matches =
    Element.prototype.matchesSelector
    || Element.prototype.mozMatchesSelector
    || Element.prototype.msMatchesSelector
    || Element.prototype.oMatchesSelector
    || Element.prototype.webkitMatchesSelector
    || function(s) {
      const matches = (this.document || this.ownerDocument).querySelectorAll(s)
      let i = matches.length
      while (--i >= 0 && matches.item(i) !== this) { }
      return i > -1
    }

if (!Element.prototype.closest)
  Element.prototype.closest = function(s) {
    let el = this
    if (!document.documentElement.contains(el)) return null
    do {
      if (el.matches(s)) return el
      el = el.parentElement
    } while (el !== null)
    return null
  }
