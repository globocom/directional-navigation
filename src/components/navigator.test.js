import Navigator from './navigator'
import { KeyCode } from '../constants'

describe('Navigator', () => {
  describe('keyMap config', () => {
    it('uses default key codes if not present in the configuration', () => {
      const config = new Navigator().getConfig()

      expect(config.keyMap.left).toBe(KeyCode.LEFT)
      expect(config.keyMap.up).toBe(KeyCode.UP)
      expect(config.keyMap.right).toBe(KeyCode.RIGHT)
      expect(config.keyMap.down).toBe(KeyCode.DOWN)
      expect(config.keyMap.enter).toBe(KeyCode.ENTER)
    })

    it('uses key codes defined in the configuration if present', () => {
      const config = new Navigator({
        keyMap: {
          left: 1000,
          up: 1001,
          right: 1002,
          down: 1003,
          enter: 1004,
        },
      }).getConfig()

      expect(config.keyMap.left).toBe(1000)
      expect(config.keyMap.up).toBe(1001)
      expect(config.keyMap.right).toBe(1002)
      expect(config.keyMap.down).toBe(1003)
      expect(config.keyMap.enter).toBe(1004)
    })
  })
})
