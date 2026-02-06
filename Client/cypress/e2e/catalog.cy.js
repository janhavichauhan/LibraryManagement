describe('Catalog Page - Book Management', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the catalog page correctly', () => {
    cy.contains('Library Catalog').should('be.visible')
    cy.contains('Manage books, loans, and waitlists').should('be.visible')
    cy.contains('Populate Library').should('be.visible')
    cy.contains('Add Manual').should('be.visible')
  })

  it('should open and close the manual add book modal', () => {
    cy.contains('Add Manual').click()
    cy.contains('Add Manual Book').should('be.visible')
    cy.get('input[placeholder="Title"]').should('be.visible')
    cy.get('input[placeholder="Author"]').should('be.visible')
    
    cy.contains('button', 'Cancel').click()
    cy.contains('Add Manual Book').should('not.exist')
  })

  it('should add a book manually', () => {
    cy.contains('Add Manual').click()
    
    const bookTitle = `Test Book ${Date.now()}`
    cy.get('input[placeholder="Title"]').type(bookTitle)
    cy.get('input[placeholder="Author"]').type('Test Author')
    cy.get('input[placeholder="Tags (comma separated)"]').type('fiction,test')
    
    cy.contains('button', 'Save').click()
    
    cy.contains(bookTitle, { timeout: 10000 }).should('be.visible')
  })

  it('should search for books', () => {
    cy.get('input[placeholder="Search local library..."]').type('Test')
    cy.wait(500)
  })

  it('should display book cards with correct elements', () => {
    cy.get('[class*="grid"]').within(() => {
      cy.get('[class*="bg-white"]').first().within(() => {
        cy.get('h3').should('exist')
        cy.get('p').should('exist')
      })
    })
  })

  it('should open populate library modal', () => {
    cy.contains('Populate Library').click()
    cy.contains('Search the web').should('be.visible')
    cy.get('input[placeholder="Enter topic..."]').should('be.visible')
  })

  it('should show quick explore genre buttons', () => {
    cy.contains('Populate Library').click()
    cy.contains('Quick Explore').should('be.visible')
    cy.contains('Sci-Fi').should('be.visible')
    cy.contains('Business').should('be.visible')
    cy.contains('Mystery').should('be.visible')
  })

  it('should search books from Open Library', () => {
    cy.contains('Populate Library').click()
    cy.get('input[placeholder="Enter topic..."]').type('Python')
    cy.contains('button', 'Search').click()
    cy.wait(2000)
  })

  it('should display delete button on hover', () => {
    cy.get('[class*="grid"]').within(() => {
      cy.get('[class*="bg-white"]').first().trigger('mouseover')
      cy.get('button[title="Delete book"]').should('exist')
    })
  })

  it('should show lend book button for available books', () => {
    cy.contains('AVAILABLE').should('exist')
    cy.contains('Lend Book').should('exist')
  })
})

describe('Book Lending Flow', () => {
  let testBook
  let testMember

  before(() => {
    cy.addBook({
      title: `Lending Test Book ${Date.now()}`,
      author: 'Test Author',
      tags: ['test'],
      coverImage: ''
    }).then((response) => {
      testBook = response.body
    })

    cy.addMember({
      firstName: 'John',
      lastName: 'Doe'
    }).then((response) => {
      testMember = response.body
    })
  })

  beforeEach(() => {
    cy.visit('/')
  })

  it('should open lend modal when clicking lend book', () => {
    cy.contains('Lend Book').first().click()
    cy.contains('Choose Member').should('be.visible')
    cy.contains('button', 'Confirm').should('be.visible')
  })

  it('should lend a book to a member', () => {
    cy.contains('AVAILABLE').parent().parent().parent().within(() => {
      cy.contains('Lend Book').click()
    })
    
    cy.get('select').select(1)
    cy.contains('button', 'Confirm').click()
    cy.wait(1000)
  })

  it('should show take back button for borrowed books', () => {
    cy.wait(1000)
    cy.reload()
    cy.contains('Take Back').should('exist')
  })

  it('should display waitlist badge', () => {
    cy.contains('BORROWED').should('exist')
  })
})

describe('Book Deletion', () => {
  it('should delete an available book', () => {
    cy.visit('/')
    
    cy.get('[class*="bg-white"]').first().trigger('mouseover')
    cy.get('button[title="Delete book"]').first().click({ force: true })
    cy.wait(500)
  })
})
