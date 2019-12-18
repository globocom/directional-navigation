import Navigation from './navigation';
import MinkowskiDistance from './minkowski-distance'

class TVNavigation {
  constructor() {
    this.destroy();
  }

  init = () => {
    Navigation.init();
    Navigation.focus();
    this.bindFocusEvent();
  }

  destroy = () => {
    this.focusedPath = null;

    Navigation.uninit();
    this.unbindFocusEvent();
  }

  bindFocusEvent = () => {
    if (!this.listening) {
      this.listening = true;
      document.addEventListener('sn:focused', this.handleFocused);
    }
  }

  unbindFocusEvent = () => {
    document.removeEventListener('sn:focused', this.handleFocused);
    this.listening = false;
  }

  handleFocused = (ev) => {
    if (this.focusedPath !== ev.detail.sectionId) {
      this.setCurrentFocusedPath(ev.detail.sectionId)
    }
  }

  getCurrentFocusedPath = () => this.focusedPath;

  setCurrentFocusedPath = (focusPath) => {
    console.log('setCurrentFocusedPath called.')
    this.focusedPath = focusPath;
    Navigation.focus(focusPath);
  }

  addFocusable = (focusDOMElement, { focusPath, onEnterPressHandler }) => {
    if (!focusDOMElement || Navigation.getSectionId(focusDOMElement)) {
      return;
    }

    this.removeFocusable(focusDOMElement, { onEnterPressHandler });

    const params = [{ selector: focusDOMElement }];
    if (focusPath) {
      params.unshift(focusPath);
    }

    focusDOMElement.addEventListener('sn:enter-down', onEnterPressHandler);
    const sectionId = Navigation.add(...params);
    Navigation.makeFocusable(sectionId);
  }

  removeFocusable = (focusDOMElement, { onEnterPressHandler }) => {
    const sectionId = Navigation.getSectionId(focusDOMElement);
    if (!sectionId) {
      return;
    }

    Navigation.remove(sectionId);
    focusDOMElement.removeEventListener('sn:enter-down', onEnterPressHandler);
  }
}

export default new TVNavigation();
