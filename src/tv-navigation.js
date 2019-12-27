import Navigation from './js-spatial-navigation';

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
    this.focusedPath = focusPath;
    Navigation.focus(focusPath);
  }

  addEventListener = (selector, event, fn) => {
    document.querySelectorAll(selector).forEach((elem) => elem.addEventListener(event, fn))
    return this
  }

  addFocusable = (config, onEnterPressHandler) => {
    if (!config || Navigation.getSectionId(document.getElementById(config.id))) {
      return;
    }

    this.removeFocusable(config);

    const sectionId = Navigation.add(config);

    if (onEnterPressHandler) {
      this.addEventListener(config.selector, 'sn:enter-down', onEnterPressHandler)
    }

    Navigation.makeFocusable(sectionId);
  }

  removeFocusable = (config) => {
    const sectionId = Navigation.getSectionId(document.getElementById(config.id));
    if (!sectionId) {
      return;
    }

    Navigation.remove(sectionId);
    document.querySelectorAll(config.selector).removeEventListener('sn:enter-down');
  }
}

export default new TVNavigation();
