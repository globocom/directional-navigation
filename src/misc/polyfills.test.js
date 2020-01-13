import './polyfills'
import $ from 'clappr-zepto'

describe('Polyfills', () => {
  describe('all polyfills should be present', () => {
    it('test if matches polyfill is present', () => {
      expect(Element.prototype.matches).toBeDefined()
    })

    it('test if closest polyfill is present', () => {
      $(document.body).append('<div class=\'focusable\'/>')
      $('.focusable').append('<div class=\'some-div\'/>')
      expect($('.some-div').closest('.focusable')).not.toBeFalsy()
    })
  })
})
