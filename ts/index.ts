import { Navigator } from './navigator'

const navigator = new Navigator('#middlebox .focusable');

navigator.init();

navigator.addEventListener('#middlebox .focusable', 'sn:enter-down', function ({ target }) {
  console.log('enter-down', target);
  // @ts-ignore
  target.classList.add('active');
});

navigator.addEventListener('#middlebox .focusable', 'sn:willunfocus', function ({ target }) {
  console.log('willunfocus', target);
});

navigator.addEventListener('#middlebox .focusable', 'sn:unfocused', function ({ target }) {
  console.log('unfocused', target);
});

navigator.addEventListener('#middlebox .focusable', 'sn:willfocus', function ({ target }) {
  console.log('willfocus', target);
});

navigator.addEventListener('#middlebox .focusable', 'sn:focused', function ({ target }) {
  console.log('focused', target);
});

navigator.focusFirst();
