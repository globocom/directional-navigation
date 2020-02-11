describe('Navigation', () => {
  describe('render', () => {
    it('chrome selected', () => {
      cy.visit('cypress/fixtures/five-elements.html')
      cy.get('.icon').first().click()
      cy.get('body').type('{rightarrow}')
      cy.get('#opera').should('have.focus')
    })

    it('render opera selected', () => {
      cy.visit('cypress/fixtures/five-elements.html')
      cy.get('.icon').first().click()
      cy.get('body').type('{rightarrow}')
      cy.get('body').type('{rightarrow}')
      cy.get('#chrome').should('have.focus')
    })

    it('render selected in Full HD', () => {
      cy.viewport(1920, 1080)
      cy.visit('cypress/fixtures/five-elements.html')
      cy.get('.icon').first().click()
      cy.get('body').type('{rightarrow}')
      cy.get('#opera').should('have.focus')
      cy.get('body').type('{downarrow}')
      cy.get('#internet-explorer').should('have.focus')
      cy.get('body').type('{uparrow}')
      cy.get('#click-add').should('have.focus')
      cy.get('body').type('{uparrow}')
      cy.get('#click-add').should('have.focus')
      cy.get('body').type('{rightarrow}')
      cy.get('#opera').should('have.focus')
    })
  })

  describe('render as samsung-s10', () => {
    it('chrome selected', () => {
      cy.viewport('samsung-s10')
      cy.visit('cypress/fixtures/five-elements.html')
      cy.get('.icon').first().click()
      cy.get('body').type('{rightarrow}')
      cy.get('#chrome').should('have.focus')
    })

    it('opera selected', () => {
      cy.viewport('samsung-s10')
      cy.visit('cypress/fixtures/five-elements.html')
      cy.get('.icon').first().click()
      cy.get('body').type('{rightarrow}')
      cy.get('body').type('{rightarrow}')
      cy.get('#opera').should('have.focus')
    })

    it('opera selected', () => {
      cy.viewport('samsung-s10')
      cy.visit('cypress/fixtures/five-elements.html')
      cy.get('.icon').first().click()
      cy.get('body').type('{rightarrow}')
      cy.get('body').type('{downarrow}')
      cy.get('body').type('{uparrow}')
      cy.get('#opera').should('have.focus')
    })
  })
})
