describe('Reports Page', () => {
  beforeEach(() => {
    cy.visit('/reports')
  })

  it('should display the reports page correctly', () => {
    cy.contains('Library Reports').should('be.visible')
  })

  it('should display overdue books section', () => {
    cy.contains('Overdue Loans').should('be.visible')
  })

  it('should display top books section', () => {
    cy.contains('Top').should('exist')
    cy.contains('Books').should('exist')
  })

  it('should show reports cards layout', () => {
    cy.get('[class*="grid"]').should('exist')
  })

  it('should display book count badges', () => {
    cy.get('[class*="rounded"]').should('exist')
  })
})
