const navigation = new TVNavigation()

// Initialize
navigation.init()

// Add the second section "middlebox".
navigation.addFocusable({
  id: 'middlebox',
  selector: '#middlebox .focusable',

  // Focus the last focused element first then entering this section.
  enterTo: '',
})

navigation.addEventListener('#middlebox .focusable', 'sn:enter-down', evt => evt.target.classList.add('active'))

// Focus section "middlebox" by default.
navigation.setCurrentFocusedPath('middlebox')
