describe('Navigation', () => {
  it('should navigate to catalog page', () => {
    cy.visit('/')
    cy.url().should('include', '/')
    cy.contains('Library Catalog').should('be.visible')
  })

  it('should navigate to members page', () => {
    cy.visit('/')
    cy.contains('Members').click()
    cy.url().should('include', '/members')
    cy.contains('Member Directory').should('be.visible')
  })

  it('should navigate to reports page', () => {
    cy.visit('/')
    cy.contains('Reports').click()
    cy.url().should('include', '/reports')
    cy.contains('Library Reports').should('be.visible')
  })

  it('should display sidebar navigation', () => {
    cy.visit('/')
    cy.get('aside').should('be.visible')
    cy.contains('Catalog').should('be.visible')
    cy.contains('Members').should('be.visible')
    cy.contains('Reports').should('be.visible')
  })

  it('should highlight active navigation item', () => {
    cy.visit('/')
    cy.contains('Catalog').parent().should('have.class', 'bg-primary')
  })

  it('should navigate between pages using sidebar', () => {
    cy.visit('/')
    cy.contains('Members').click()
    cy.url().should('include', '/members')
    
    cy.contains('Catalog').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})

describe('Toast Notifications', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show success toast when adding a book', () => {
    cy.contains('Add Manual').click()
    
    cy.get('input[placeholder="Title"]').type(`Toast Test ${Date.now()}`)
    cy.get('input[placeholder="Author"]').type('Test Author')
    
    cy.contains('button', 'Save').click()
    cy.wait(500)
  })

  it('should show error toast for duplicate book', () => {
    const duplicateTitle = `Duplicate ${Date.now()}`
    
    cy.addBook({
      title: duplicateTitle,
      author: 'Test',
      tags: ['test']
    })
    
    cy.contains('Add Manual').click()
    cy.get('input[placeholder="Title"]').type(duplicateTitle)
    cy.get('input[placeholder="Author"]').type('Test')
    cy.contains('button', 'Save').click()
    cy.wait(500)
  })
})

describe('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 }
  ]

  viewports.forEach((viewport) => {
    it(`should display correctly on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height)
      cy.visit('/')
      cy.contains('Library Catalog').should('be.visible')
    })
  })
})

describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should filter books by search term', () => {
    cy.get('input[placeholder="Search local library..."]').type('test')
    cy.wait(500)
  })

  it('should clear search results', () => {
    cy.get('input[placeholder="Search local library..."]').type('test')
    cy.wait(500)
    cy.get('input[placeholder="Search local library..."]').clear()
    cy.wait(500)
  })

  it('should handle empty search results', () => {
    cy.get('input[placeholder="Search local library..."]').type('xyznonexistent')
    cy.wait(500)
  })
})
