export const elementMatchesSelector =
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
