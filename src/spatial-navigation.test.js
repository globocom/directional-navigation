import SpatialNavigation from '../src/spatial-navigation';
import Navigation from '../src/navigation'

describe('SpatialNavigation', () => {
  beforeEach(() => {
    SpatialNavigation.setCurrentFocusedPath = jest.fn()
    SpatialNavigation.init();
  });

  afterEach(() => {
    SpatialNavigation.destroy();
  });

  describe('on initialize', () => {
    it('listens to sn:focused event', () => {
      const event = new CustomEvent('sn:focused', {
        detail: { sectionId: 'focusPath' },
      });
      document.dispatchEvent(event);

      expect(SpatialNavigation.setCurrentFocusedPath).toHaveBeenCalled();
    });

    describe('when focusing the same focused element', () => {
      it('does nothing', () => {
        SpatialNavigation.focusedPath = 'focusPath';

        const event = new CustomEvent('sn:focused', {
          detail: { sectionId: 'focusPath' },
        });
        document.dispatchEvent(event);

        expect(SpatialNavigation.setCurrentFocusedPath).not.toHaveBeenCalled();
      });
    });
  });

  describe('on destroy', () => {
    it('stops listening to sn:focused', () => {
      SpatialNavigation.destroy();

      const event = new CustomEvent('sn:focused', {
        detail: { sectionId: 'focusPath' },
      });
      document.dispatchEvent(event);

      expect(SpatialNavigation.setCurrentFocusedPath).not.toHaveBeenCalled();
    });
  });
});
