describe('Navigation six elements', () => {
  describe('render', () => {
    it('selects an element shown after click on selected element', () => {
      cy.viewport(1920, 1080)
      cy.visit('cypress/fixtures/six-elements.html')
      cy.get('.icon').first().click()
      cy.get('body').type('{rightarrow}')
      cy.get('#black').should('have.focus')
      cy.get('body').type('{rightarrow}')
      cy.get('#blue').should('have.focus')
      cy.get('body').type('{uparrow}')
      cy.get('#blue').first().click()
      cy.get('body').type('{leftarrow}')
      cy.get('#green').should('have.focus')
      cy.get('body').type('{leftarrow}')
      cy.get('#click-add').should('have.focus')
      cy.get('body').type('{rightarrow}')
      cy.get('#green').should('have.focus')
      cy.get('body').type('{downarrow}')
      cy.get('#black').should('have.focus')
    })

    it('appends a new element to DOM dynamically', () => {
      cy.viewport(1920, 1080)
      cy.visit('cypress/fixtures/six-elements.html')
      cy.get('.icon').first().click()
      cy.get('body').type('{rightarrow}')
      cy.get('body').type('{rightarrow}')
      cy.get('#yellow').first().click()
      cy.get('body').type('{leftarrow}')
      cy.get('#black').should('have.focus')
      cy.get('body').type('{rightarrow}')
      cy.get('#aquamarine').should('have.focus')
    })
  })
})
