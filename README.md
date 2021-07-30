# ⬅️⬆️ Directional Navigation ▶️⬇️

A javascript-based implementation of [spatial navigation](https://en.wikipedia.org/wiki/Spatial_navigation) built upon the work of [Luke Chang's JavaScript SpatialNavigation project](https://github.com/luke-chang/js-spatial-navigation) and inspired by the [Netflix TV Navigation System](https://medium.com/netflix-techblog/pass-the-remote-user-input-on-tv-devices-923f6920c9a8).

# Table of Contents

* [Examples](#examples)
* [Documentation](#documentation)
  + [API Reference](#api)
  + [Configuration](#configuration)
  + [Custom Attributes](#custom-attributes)
  + [Selector](#selector-1)
  + [Events](#events)
* [Next steps](#next-steps)
* [License](#license)

# Examples

### Basic usage

```javascript
import Navigator from 'directional-navigator'

// Creates a navigator instance.
// This instance should be a singleton in the lifecyle of your app.
const navigator = new Navigator()

// Initializes the navigator instance.
// It binds event listeners to the global scope to watch for KeyboardEvents.
navigator.init()

// Adds a new section to the navigator and make all elements in it focusable.
// A section is a group of elements with some relationship, be it behavioural or functional.
// Navigation of elements belonging to a section and across sections are automatically managed.
navigator.addFocusable({
  id: 'my-section',  // name of the section. Must be unique.
  selector: '.grid .focusable' // selector to find the elements.
})

// navigator dispatches a few custom events that you can subscribe to.
document.querySelectorAll('.grid .focusable').forEach(element => {
  element.addEventListener('sn:focused', (event) => {
    console.log('Focus on element', event.target)
  })
})
document.addEventListener('sn:unfocused', (event) => {
  // Custom events bubble up. You can listen to them on parent elements as well.
  console.log('Unfocus on element', event.target)
})
document.querySelectorAll('.grid .focusable.right-blocked').forEach(element => {
  element.addEventListener('sn:willmove', (event) => {
    // Some events are cancellable.
    // Here we prevent some elements to loose focus when moving to the right.
    if (event.detail.direction === 'right') {
        event.preventDefault()
    }
  })
})

// Binding events to many elements at once can be verbose.
// navigator also offers a convenient method to do that for you.
navigator.addEventListener('.grid .focusable', 'sn:enter-down', (event) => {
  console.log('Enter down on element', event.target)
  event.target.classList.toggle('active')
})

// Destroy the navigator when done to reset its state and remove any event handlers in place.
navigator.destroy()

```
```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        height: 80vh;
        padding: 10vh;
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        grid-column-gap: 5%;
        grid-row-gap: 5%;
        justify-items: stretch;
        align-items: stretch;
        height: 100%
      }

      .cell {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background: hsl(217, 70%, 50%);
        color: white;
        font-size: 2em;
        border-radius: 5px;
      }

      .cell.active {
        background: hsl(217, 70%, 25%);
      }

      .cell:focus {
        border: 5px solid red;
      }
    </style>
  </head>
  <body>
    <div class="grid">
        <div class='cell focusable'><p>1</p></div>
        <div class='cell focusable'><p>2</p></div>
        <div class='cell focusable'><p>3</p></div>
        <div class='cell focusable'><p>4</p></div>
        <div class='cell focusable right-blocked'><p>5</p></div>
        <div class='cell focusable'><p>6</p></div>
        <div class='cell focusable'><p>7</p></div>
        <div class='cell focusable'><p>8</p></div>
        <div class='cell focusable'><p>9</p></div>
    </div>
  </body>
</html>
```

# Documentation

## API

#### `navigator.init()`

Initializes navigator and binds event listeners to the global object. It is a synchronous function, so you don't need to await ready state. Calling `init()` more than once is possible since navigator internally prevents it from reiterating the initialization.

**Note:** It should be called before using any other methods of navigator.

#### `navigator.destroy()`

Uninitializes `navigator`, resets the state and unbinds the event listeners.

#### `navigator.clear()`

Resets the state without unbinding the event listeners.

#### `navigator.add([sectionId], config)`

  + `sectionId`: (optional) `String`
  + `config`: [Configuration](#configuration)

Adds a section to `navigator` with its own configuration. The `config` doesn't have to contain all the properties. Those omitted will inherit global ones automatically.

A section is a conceptual scope to define a set of elements no matter where they are in DOM structure. You can group elements based on their functions or behaviors (e.g. main, menu, dialog, etc.) into a section.

Giving a `sectionId` to a section enables you to refer to it in other methods but is not required. `navigator` allows you to set it by `config.id` alternatively, yet it is not allowed in `set()`.

#### `navigator.addFocusable(config, [onEnterPressHandler])`
  + `config`: [Configuration](#configuration)
  + `onEnterPressHandler`: (optional) `function(Event)`

Same as `add` but automatically makes elements inside a section focusable by adding  `tabindex = "-1"` if necessary. You can configure whether an element should be assigned a tabindex or not by providing a `tabIndexIgnoreList`.

An optional `onEnterPressHandler` callback to enter down events can also be provided. It will be applied to all elements belonging to the newly created section.
#### `navigator.remove(sectionId)`

  + `sectionId`: `String`

Removes the section with the specified `sectionId` from `navigator`. Elements defined in this section will not be navigated anymore.

#### `navigator.set([sectionId], config)`

  + `sectionId`: (optional) `String`
  + `config`: [Configuration](#configuration)

Updates the `config` of the section with the specified `sectionId`. If `sectionId` is omitted, the global configuration will be updated.

Omitted properties in `config` will not affect the original one, which was set by either `add()` or `addFocusable()`, so only properties that you want to update need to be listed. In other words, if you want to delete any previously added properties, you have to explicitly assign `undefined` to those properties in the `config`.

#### `navigator.disable(sectionId)`

  + `sectionId`: `String`

Disables the section with the specified `sectionId` temporarily. Elements defined in this section will become unnavigable until `enable()` is called.

#### `navigator.enable(sectionId)`

  + `sectionId`: `String`

Enables the section with the specified `sectionId`. Elements defined in this section, on which if `disable()` was called earlier, will become navigable again.

#### `navigator.pause()`

Makes `navigator` pause until `resume()` is called. During its pause, `navigator` stops to react to key events and will not trigger any custom events.

#### `navigator.resume()`

Resumes `navigator`, so it can react to key events and trigger events which paused because of `pause()`.

#### `navigator.setCurrentFocusedPath([sectionId/selector])`

  + `sectionId/selector`: (optional) `String` / [Selector](#selector-1) (without @ syntax)

Focuses the section with the specified `sectionId` or the first element that matches `selector`.

If the first argument matches any of the existing `sectionId`, it will be regarded as a `sectionId`. Otherwise, it will be treated as `selector` instead. If omitted, the default section, which is set by `setDefaultSection()`, will be the substitution.

#### `navigator.getCurrentFocusedPath()`

Returns the `sectionId/selector` of the element currently in focus.
#### `navigator.move(direction, [selector])`

  + `direction`: `'left'`, `'right'`, `'up'` or `'down'`
  + `selector`: (optional) [Selector](#selector-1) (without @ syntax)

Moves the focus to the given `direction` based on the rule of `navigator`. The first element matching `selector` is regarded as the origin. If `selector` is omitted, `navigator` will move the focus based on the currently focused element.

#### `navigator.setDefaultSection([sectionId])`

  + `sectionId`: (optional) `String`

Assigns the specified section to be the default section. It will be used as a substitution in certain methods, of which if `sectionId` is omitted.

Calling this method without the argument can reset the default section to `undefined`.

#### `navigator.addEventListener(selector, event, handler, [useCapture = false])`
  + `selector`: [Selector](#selector-1) (without @ syntax)
  + `event`: `String`
  + `handler`: `function(Event)`
  + `useCapture`: (optional) `Boolean`

Utility method to add an event listener to all elements matched by `selector`.

#### `navigator.removeEventListener(selector, event, handler, [useCapture = false])`
  + `selector`: [Selector](#selector-1) (without @ syntax)
  + `event`: `String`
  + `handler`: `function(Event)`
  + `useCapture`: (optional) `Boolean`

Utility method to remove an event listener from all elements matched by `selector`.
## Configuration

Configuration is a plain object with configurable properties.

There are two kinds of the configuration: global and per-section. If you call `set(config)` without specifying `sectionId`, it will apply to the global one, from which the omitted per-section properties will inherit automatically.

Following is an example with default values.

```javascript
{
  selector: '',
  rememberSource: false,
  disabled: false,
  defaultElement: '',
  enterTo: '',
  leaveFor: null,
  restrict: 'self-first',
  tabIndexIgnoreList: [],
  navigableFilter: null,
  eventPrefix: 'sn:',
  idPoolPrefix: 'section-',
  keyMap: {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    enter: 13
  }
}
```

#### `selector`

  + Type: [Selector](#selector-1)
  + Default: `''`

Elements matching `selector` are regarded as navigable elements in `navigator`. However, hidden or disabled elements are ignored as they can not be focused in any way.

#### `rememberSource`

  + Type: `Boolean`
  + Default: `false`

When it is `true`, the previously focused element will have higher priority to be chosen as the next candidate.

#### `disabled`

  + Type: `Boolean`
  + Default: `false`

When it is `true`, elements defined in this section are unnavigable. This property is modified by `disable()` and `enable()` as well.

#### `defaultElement`

  + Type: [Selector](#selector-1) (without @ syntax)
  + Default: `''`

When a section is specified to be the next focused target, e.g. `focus('some-section-id')` is called, the first element matching `defaultElement` within this section will be chosen first.

#### `enterTo`

  + Type: `''`, `'last-focused'` or `'default-element'`
  + Default: `''`

If the focus comes from another section, you can define which element in this section should be focused first.

`'last-focused'` indicates the last focused element before we left this section last time. If this section has never been focused yet, the default element (if any) will be chosen next.

`'default-element'` indicates the element defined in `defaultElement`.

`''` (empty string) implies following the original rule without any change.

#### `leaveFor`

  + Type: `null` or `Object`
  + Default: `null`

This property specifies which element should be focused next when a user presses the corresponding arrow key and intends to leave the current section.

It should be an `Object` consisting of four properties: `'left'`, `'right'`, `'up'` and `'down'`. Each property should be a [Selector](#selector-1). Any of these properties can be omitted, and `navigator` will follow the original rule to navigate.

**Note:** Assigning an empty string to any of these properties makes `navigator` go nowhere at that direction.

#### `restrict`

  + Type: `'self-first'`, `'self-only'` or `'none'`
  + Default: `'self-first'`

`'self-first'` implies that elements within the same section will have higher priority to be chosen as the next candidate.

`'self-only'` implies that elements in the other sections will never be navigated by arrow keys. (However, you can always focus them by calling `focus()` manually.)

`'none'` implies no restriction.

#### `tabIndexIgnoreList`

  + Type: [Selector](#selector-1) (without @ syntax)
  + Default: `[]`

Elements matching `tabIndexIgnoreList` will not be forced to be focusable by adding `tabindex` as `-1`. It is usually used to ignore elements that are already focusable.

#### `navigableFilter`

  + Type: `null` or `function(HTMLElement)`
  + Default: `null`

A callback function that accepts a DOM element as the first argument.

`navigator` calls this function every time when it tries to traverse every single candidate. You can ignore arbitrary elements by returning `false`.

#### `eventPrefix`

  + Type: `String`
  + Default: `'sn:'`

A preffix used to name all custom events trigged by `navigator`.

#### `idPoolPrefix`

  + Type: `String`
  + Default: `'section'`

A preffix used to name a section automatically when its `id` is not specified on creation. Sections created without `id` use this preffix followed by a monotonically increasing integer, starting from `0` (e.g., `{preffix}0`, `{preffix}1`, ...).

#### `keyMap`

  + Type: `Object`
  + Default: ```{
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    enter: 13
  }```

An object mapping key codes to key names that `navigator` will use to interpret `KeyboardEvent` events.

## Custom Attributes

`navigator` supports HTML `data-*` attributes as follows:

  + `data-sn-left`
  + `data-sn-right`
  + `data-sn-up`
  + `data-sn-down`

They specifies which element should be focused next when a user presses the corresponding arrow key. This setting overrides any other settings in `enterTo` and `leaveFor`.

The value of each attribute should be a [Selector](#selector-1) and only accepts strings (the **valid selector string** and **`@` syntax** described below). Any of these attributes can be omitted, and `navigator` will follow the original rule to navigate.

**Note:** Assigning an empty string to any of these attributes makes `navigator` go nowhere at that direction.

## Selector

The type "Selector" can be any of the following types.

* a valid selector string for "querySelectorAll" (if it exists)
* a [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) or an array containing DOM elements
* a single DOM element
* a string `'@<sectionId>'` to indicate the specified section (e.g. `'@test-section'` indicates the section whose id is `test-section`.
* a string `'@'` to indicate the default section

**Note:** Certain methods do not accept the `@` syntax (including both `@` and `@<sectionId>`).

## Events

Following custom events are triggered by `navigator`. You can bind them directly by using `EventTarget.addEventListener()` or indirectly through the `navigator.addEventListener` method. Some events are marked **"cancelable"**, which means you can cancel them by `Event.preventDefault()`, as usual.

Focus-related events are also wrappers of the native `focus`/`blur` events, so they are triggered as well even if `navigator` is not involved. In this case, some properties in `event.detail` may be omitted. This kind of properties is marked **"Navigation Only"** below.

#### `sn:willmove`

+ bubbles: `true`
+ cancelable: `true`
+ detail:
  - cause: `'keydown'` or `'api'`
  - sectionId: `String`
  - direction: `'left'`, `'right'`, `'up'` or `'down'`

Fired when `navigator` is about to move the focus.

`cause` indicates why this move happens. `'keydown'` means triggered by key events while `'api'` means triggered by calling `move()`) directly.

`sectionId` indicates the currently focused section.

`direction` indicates the direction given by arrow keys or `move()` method.

#### `sn:willunfocus`

  + bubbles: `true`
  + cancelable: `true`
  + detail:
    - nextElement: `HTMLElement` (Navigation Only)
    - nextSectionId: `String` (Navigation Only)
    - direction: `'left'`, `'right'`, `'up'` or `'down'` (Navigation Only)
    - native: `Boolean`

Fired when an element is about to lose the focus.

`nextElement` and `nextSectionId` indicate where the focus will be moved next.

`direction` is similar to `sn:willmove` but will be omitted here if this move is not caused by direction-related actions (e.g. by `@` syntax or `focus()` directly).

`native` indicates whether this event is triggered by native focus-related events or not.

**Note:** If it is caused by native `blur` event, `navigator` will try to focus back to the original element when you cancel it (but not guaranteed).

#### `sn:unfocused`

  + bubbles: `true`
  + cancelable: `false`
  + detail:
    - nextElement: `HTMLElement` (Navigation Only)
    - nextSectionId: `String` (Navigation Only)
    - direction: `'left'`, `'right'`, `'up'` or `'down'` (Navigation Only)
    - native: `Boolean`

Fired when an element just lost the focus.

Event details are the same as `sn:willunfocus`.

#### `sn:willfocus`

  + bubbles: `true`
  + cancelable: `true`
  + detail:
    - sectionId: `String`
    - previousElement: `HTMLElement` (Navigation Only)
    - direction: `'left'`, `'right'`, `'up'` or `'down'` (Navigation Only)
    - native: `Boolean`

Fired when an element is about to get the focus.

`sectionId` indicates the currently focused section.

`previousElement` indicates the last focused element before this move.

`direction` and `native` are the same as `sn:willunfocus`.

**Note:** If it is caused by native `focus` event, `navigator` will try to blur it immediately when you cancel it (but not guaranteed).

#### `sn:focused`

  + bubbles: `true`
  + cancelable: `false`
  + detail:
    - sectionId: `String`
    - previousElement: `HTMLElement` (Navigation Only)
    - direction: `'left'`, `'right'`, `'up'` or `'down'` (Navigation Only)
    - native: `Boolean`

Fired when an element just got the focus.

Event details are the same as `sn:willfocus`.

#### `sn:navigatefailed`

  + bubbles: `true`
  + cancelable: `false`
    - direction: `'left'`, `'right'`, `'up'` or `'down'`

Fired when `navigator` fails to find the next element to be focused.

`direction` is the same as `sn:willunfocus`.

#### `sn:enter-down`

  + bubbles: `true`
  + cancelable: `true`

Fired when ENTER key is pressed down.

#### `sn:enter-up`

  + bubbles: `true`
  + cancelable: `true`

Fired when ENTER key is released.


## Next steps

- Improve suite of e2e tests;
- Set up continuous integration pipeline;
- Make frustum angle configurable.

## License

Directional navigation is [MIT licensed](https://github.com/globocom/directional-navigation/blob/13794be5bce2da04ff4f0c9ef0474133b1a891fa/LICENSE).
