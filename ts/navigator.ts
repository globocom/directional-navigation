class Navigator {
  constructor(private selector: string, private lastFocusedElement?: HTMLElement) {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseClickOrDown = this.onMouseClickOrDown.bind(this);
  }

  init() {
    this.bindEvents();

    this.searchFocusableElements().forEach(makeFocusable);
  }

  private bindEvents() {
    addEventListener(document, 'click', this.onMouseClickOrDown);
    addEventListener(document, 'mouseover', this.onMouseOver);
    addEventListener(document, 'mousedown', this.onMouseClickOrDown);
    addEventListener(document, 'keydown', this.onKeyDown);
  }

  focusFirst() {
    const focusableElement = this.searchFocusableElements()[0];
    if (focusableElement) {
      changeFocus(focusableElement, this.currentOrLastFocusedElement);
      this.lastFocusedElement = focusableElement;
    }
  }

  addEventListener(target: EventTarget | string, event: string, listener: EventListener, capture?: boolean) {
    addEventListener(target, event, listener, capture)
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const keyName = Keyboard.getKeyName(event.keyCode);
    if (!keyName) {
      return;
    }

    if (keyName === 'enter') {
      return dispatchEnterDown(event, this.currentOrLastFocusedElement);
    }

    const focusedElement = navigate(this.searchFocusableElements(), keyName, this.currentOrLastFocusedElement);
    if (focusedElement) {
      this.lastFocusedElement = focusedElement;
    }

    return preventDefault(event);
  }

  private searchFocusableElements(): HTMLElement[] {
    return [].slice.call(document.querySelectorAll(this.selector))
  }

  private get currentOrLastFocusedElement(): HTMLElement | undefined {
    const { activeElement } = document;

    if (activeElement && activeElement !== document.body)
      return activeElement as HTMLElement;

    return this.lastFocusedElement
  }

  private onMouseOver(event: MouseEvent) {
    const { target } = event;

    if (!target) {
      return;
    }

    const focusableElement = findClosestFocusableElement(target as HTMLElement);
    if (!focusableElement) {
      return;
    }

    if (changeFocus(focusableElement, this.currentOrLastFocusedElement)) {
      this.lastFocusedElement = focusableElement;
    }

    return preventDefault(event);
  }

  private onMouseClickOrDown(event: MouseEvent) {
    const { target } = event;

    if (!target) {
      return;
    }

    const focusableElement = findClosestFocusableElement(target as HTMLElement);
    if (!focusableElement) {
      return;
    }

    return dispatchEnterDown(event, focusableElement);
  }

  destroy() {
    this.unbindEvents();
  }

  private unbindEvents() {
    document.removeEventListener('click', this.onMouseClickOrDown);
    document.removeEventListener('mouseover', this.onMouseOver);
    document.removeEventListener('mousedown', this.onMouseClickOrDown);
    document.removeEventListener('keydown', this.onKeyDown);
  }
}

function makeFocusable(element: HTMLElement) {
  if (!element.getAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1')
  }
}

function findClosestFocusableElement(target: HTMLElement): HTMLElement | undefined {
  if (target.classList.contains('focusable')) {
    return target;
  }

  return closest(target, '.focusable')
}

function closest(el: HTMLElement, query: string): HTMLElement | null {
  if (!document.documentElement.contains(el)) return null;
  do {
    if (matches(el, query)) return el;
    el = el.parentElement
  } while (el !== null);
  return null;
}

function matches(el: HTMLElement, query: string): boolean {
  const matches = document.querySelectorAll(query);
  let i = matches.length;
  while (--i >= 0 && matches.item(i) !== el) { /* do nothing */
  }
  return i > -1
}

namespace Keyboard {
  const KEY_MAPPING = {
    4: 'left',
    21: 'left',
    37: 'left',
    214: 'left',
    205: 'left',
    218: 'left',
    5: 'right',
    22: 'right',
    39: 'right',
    213: 'right',
    206: 'right',
    217: 'right',
    29460: 'up',
    19: 'up',
    38: 'up',
    211: 'up',
    203: 'up',
    215: 'up',
    29461: 'down',
    20: 'down',
    40: 'down',
    212: 'down',
    204: 'down',
    216: 'down',
    29443: 'enter',
    13: 'enter',
    67: 'enter',
    32: 'enter',
    23: 'enter',
    195: 'enter',
  };

  export function getKeyName(key: number): string | undefined {
    return KEY_MAPPING[key];
  }
}

namespace Metric {
  export type Direction = 'left' | 'up' | 'right' | 'down';

  export function isDirection(keyName: string): keyName is Metric.Direction {
    return ['left', 'up', 'right', 'down'].indexOf(keyName) !== -1;
  }

  export type Rectangle = {
    left: number,
    top: number,
    right: number,
    bottom: number,
    width: number,
    height: number,
    center: {
      left: number,
      top: number,
      right: number,
      bottom: number,
      x: number,
      y: number,
    }
  };

  type Point = {
    x: number,
    y: number
  };

  export function nearHorizonIsBetter(from: Rectangle, to: Rectangle): number {
    let distance = 0;

    if (to.center.y < from.center.y) {
      distance = from.center.y - to.bottom;
    } else {
      distance = to.top - from.center.y;
    }

    return distance < 0 ? 0 : distance;
  }

  export function nearestIsBetter(from: Rectangle, to: Rectangle): number {
    let distance = 0;
    distance += Math.pow(Math.abs(from.center.x - to.center.x), 2);
    distance += Math.pow(Math.abs(from.center.y - to.center.y), 2);

    return Math.pow(distance, 1 / 2);
  }

  export function topIsBetter(_, to: Rectangle): number {
    return to.top;
  }

  export function leftIsBetter(_, to: Rectangle) {
    return to.left;
  }

  export function nearPlumbLineIsBetter(from: Rectangle, to: Rectangle) {
    let distance;

    if (to.center.x < from.center.x) {
      distance = from.center.x - to.right;
    } else {
      distance = to.left - from.center.x;
    }

    return distance < 0 ? 0 : distance;
  }

  export function nearTargetLeftIsBetter(from: Rectangle, to: Rectangle): number {
    let distance;

    if (to.center.x < from.center.x) {
      distance = from.left - to.right;
    } else {
      distance = to.left - from.left;
    }

    return distance < 0 ? 0 : distance;
  }

  export function isInsideAngle(from: Point, to: Point, direction: Direction): boolean {
    const distance = calculateAngle(to, from);

    switch (direction) {
      case 'left': {
        const filterAngle = 60;
        return distance <= filterAngle / 2 || distance >= (360 - filterAngle / 2);
      }
      case 'right': {
        const filterAngle = 60;
        return distance >= (180 - filterAngle / 2) && distance <= (180 + filterAngle / 2);
      }
      case 'up': {
        const filterAngle = 120;
        return distance >= (90 - filterAngle / 2) && distance <= (90 + filterAngle / 2);
      }
      case 'down': {
        const filterAngle = 120;
        return distance >= (270 - filterAngle / 2) && distance <= (270 + filterAngle / 2);
      }
    }
  }

  function calculateAngle(a: Point, b: Point): number {
    const deltaY = b.y - a.y;
    const deltaX = b.x - a.x;
    let theta = Math.atan2(deltaY, deltaX); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]

    if (theta < 0) theta = 360 + theta; // range [0, 360)

    return theta;
  }
}

function preventDefault(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  return false
}

function addEventListener(target: EventTarget | string, event: string, listener: EventListener, capture: boolean = false) {
  if (typeof target === 'string') {
    const elements = document.querySelectorAll(target);

    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener(event, listener, capture);
    }

    return;
  }

  target.addEventListener(event, listener, capture);
}

function dispatchEnterDown(event: Event, element: HTMLElement): boolean {
  if (!dispatchEvent(element, "enter-down")) {
    return preventDefault(event);
  }

  return true;
}

function dispatchEvent(target: EventTarget, type: string, detail?: { [p: string]: any }, cancelable: boolean = true): boolean {
  const evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(`sn:${type}`, true, cancelable, detail);
  return target.dispatchEvent(evt);
}

const DISTANCE_CALCULATIONS_PRIORITIES = {
  'left': [
    Metric.nearestIsBetter,
    Metric.nearHorizonIsBetter,
    Metric.topIsBetter,
  ],
  'up': [
    Metric.nearestIsBetter,
    Metric.nearHorizonIsBetter,
    Metric.leftIsBetter,
  ],
  'right': [
    Metric.nearestIsBetter,
    Metric.nearHorizonIsBetter,
    Metric.topIsBetter,
  ],
  'down': [
    Metric.nearestIsBetter,
    Metric.nearPlumbLineIsBetter,
    Metric.topIsBetter,
    Metric.nearTargetLeftIsBetter,
  ]
};

type FocusableElement = Metric.Rectangle & { element: HTMLElement };

function navigate(elements: HTMLElement[], direction: string, currentFocused?: HTMLElement): HTMLElement | undefined {
  if (!currentFocused || !elements.length) {
    return;
  }

  if (!Metric.isDirection(direction)) {
    return;
  }

  const currentFocusable = createFocusableElement(currentFocused);

  const candidates = filterCandidates(elements, currentFocusable, direction);

  const nextFocusable = chooseNextFocusedElement(candidates, currentFocusable, direction);

  if (!nextFocusable) {
    return;
  }

  if (!changeFocus(nextFocusable.element, currentFocusable.element, direction)) {
    return;
  }

  return nextFocusable.element;
}

function createFocusableElement(element: HTMLElement): FocusableElement {
  const elementArea = element.getBoundingClientRect();
  const centerX = elementArea.left + Math.floor(elementArea.width / 2);
  const centerY = elementArea.top + Math.floor(elementArea.height / 2);

  return {
    element,
    left: elementArea.left,
    top: elementArea.top,
    right: elementArea.right,
    bottom: elementArea.bottom,
    width: elementArea.width,
    height: elementArea.height,
    center: {
      x: centerX,
      y: centerY,
      left: centerX,
      top: centerY,
      right: centerX,
      bottom: centerY
    }
  };
}

function filterCandidates(elements: HTMLElement[], currentFocused: FocusableElement, direction: Metric.Direction): FocusableElement[] {
  return elements.map(createFocusableElement)
    .filter(({ center, element }: FocusableElement) => {
      if (element.offsetWidth <= 0) {
        return false;
      }

      if (element.offsetHeight <= 0) {
        return false;
      }

      if (element.hasAttribute('disabled')) {
        return false;
      }

      if (element === currentFocused.element) {
        return false;
      }

      return Metric.isInsideAngle(currentFocused.center, center, direction)
    });
}

function chooseNextFocusedElement(candidates: FocusableElement[], currentFocusable: FocusableElement, direction: Metric.Direction): FocusableElement | undefined {
  const distanceCalculations = DISTANCE_CALCULATIONS_PRIORITIES[direction];

  candidates.sort((a: FocusableElement, b: FocusableElement) => {
    for (const calculate of distanceCalculations) {
      const delta = calculate(currentFocusable, a) - calculate(currentFocusable, b);
      if (delta) {
        return delta;
      }
    }
    return 0;
  });

  return candidates[0];
}

function changeFocus(nextFocused?: HTMLElement, currentFocused?: HTMLElement, direction?: Metric.Direction): boolean {
  if (!nextFocused) {
    return false;
  }

  if (nextFocused === currentFocused) {
    return false;
  }

  if (currentFocused && !notifyUnfocus(nextFocused, currentFocused, direction)) {
    return false;
  }

  return notifyFocus(nextFocused, currentFocused, direction);
}

function notifyUnfocus(nextFocused: HTMLElement, currentFocused: HTMLElement, direction?: Metric.Direction): boolean {
  const eventDetail = {
    nextElement: nextFocused,
    direction,
    native: false
  };

  if (!dispatchEvent(currentFocused, "willunfocus", eventDetail)) {
    return false;
  }

  currentFocused.blur();
  dispatchEvent(currentFocused, "unfocused", eventDetail, false);

  return true;
}

function notifyFocus(nextFocused: HTMLElement, currentFocused?: HTMLElement, direction?: Metric.Direction): boolean {
  const eventDetail = {
    previousElement: currentFocused,
    direction,
    native: false
  };

  if (!dispatchEvent(nextFocused, 'willfocus', eventDetail)) {
    return false;
  }

  nextFocused.focus();
  dispatchEvent(nextFocused, "focused", eventDetail, false);

  return true;
}

export { Navigator }
