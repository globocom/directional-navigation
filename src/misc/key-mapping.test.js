import { getKeyMapping } from './key-mapping'

const KEYMAPPING = {
  left: 4,
  right: 5,
  up: 19,
  down: 20,
  enter: 13,
}

let spyEventHandler

describe('getKeyMapping', () => {
  beforeEach(() => {
    spyEventHandler = jest.fn()
    document.onkeydown = spyEventHandler
  })
  describe('when a keydown event is dispatched', () => {
    describe('should get the correct direction/action by keyCode', () => {
      it('left key', () => {
        const event = new KeyboardEvent('keydown', { keyCode: KEYMAPPING.left })
        document.dispatchEvent(event)

        expect(spyEventHandler).toHaveBeenCalled()

        const [[handledEvent]] = spyEventHandler.mock.calls

        expect(handledEvent.keyCode).toBeDefined()
        expect(getKeyMapping(handledEvent.keyCode)).toBe('left')
      })

      it('right key', () => {
        const event = new KeyboardEvent('keydown', { keyCode: KEYMAPPING.right })
        document.dispatchEvent(event)

        expect(spyEventHandler).toHaveBeenCalled()

        const [[handledEvent]] = spyEventHandler.mock.calls

        expect(handledEvent.keyCode).toBeDefined()
        expect(getKeyMapping(handledEvent.keyCode)).toBe('right')
      })
    })
  })
})
