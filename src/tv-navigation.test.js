import TVNavigation from '../src/tv-navigation'

describe('TVNavigation', () => {
  beforeEach(() => {
    TVNavigation.setCurrentFocusedPath = jest.fn()
    TVNavigation.init()
  })

  afterEach(() => {
    TVNavigation.destroy()
  })

  describe('on initialize', () => {
    it('listens to sn:focused event', () => {
      const event = new CustomEvent('sn:focused', { detail: { sectionId: 'focusPath' } })
      document.dispatchEvent(event)

      expect(TVNavigation.setCurrentFocusedPath).toHaveBeenCalled()
    })

    describe('when focusing the same focused element', () => {
      it('does nothing', () => {
        TVNavigation.focusedPath = 'focusPath'

        const event = new CustomEvent('sn:focused', { detail: { sectionId: 'focusPath' } })
        document.dispatchEvent(event)

        expect(TVNavigation.setCurrentFocusedPath).not.toHaveBeenCalled()
      })
    })
  })

  describe('on destroy', () => {
    it('stops listening to sn:focused', () => {
      TVNavigation.destroy()

      const event = new CustomEvent('sn:focused', { detail: { sectionId: 'focusPath' } })
      document.dispatchEvent(event)

      expect(TVNavigation.setCurrentFocusedPath).not.toHaveBeenCalled()
    })
  })
})
