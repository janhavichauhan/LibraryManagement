describe('Complete User Workflows', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Complete lending workflow: Add book → Add member → Lend → Return', () => {
    const bookTitle = `Workflow Book ${Date.now()}`
    const memberFirst = 'Workflow'
    const memberLast = 'User'

    cy.contains('Add Manual').click()
    cy.get('input[placeholder="Title"]').type(bookTitle)
    cy.get('input[placeholder="Author"]').type('Workflow Author')
    cy.get('input[placeholder="Tags (comma separated)"]').type('workflow,test')
    cy.contains('button', 'Save').click()
    cy.wait(1000)

    cy.contains('Members').click()
    cy.contains('button', 'Add Member').click()
    cy.get('input[placeholder="First Name"]').type(memberFirst)
    cy.get('input[placeholder="Last Name"]').type(memberLast)
    cy.contains('button', 'Save Member').click()
    cy.wait(1000)

    cy.contains('Catalog').click()
    cy.contains(bookTitle).should('be.visible')
    
    cy.contains(bookTitle).parent().parent().parent().within(() => {
      cy.contains('Lend Book').click()
    })

    cy.get('select').select(`${memberFirst} ${memberLast}`)
    cy.contains('button', 'Confirm').click()
    cy.wait(1000)

    cy.contains('Members').click()
    cy.contains(memberFirst).parent().parent().parent().within(() => {
      cy.contains(bookTitle).should('be.visible')
      cy.contains('Take Back').click()
    })
    cy.wait(1000)

    cy.contains('Catalog').click()
    cy.contains(bookTitle).parent().parent().parent().within(() => {
      cy.contains('AVAILABLE').should('be.visible')
    })
  })

  it('Waitlist workflow: Lend → Add to waitlist → Return → Auto-assign', () => {
    const bookTitle = `Waitlist Book ${Date.now()}`

    cy.addBook({
      title: bookTitle,
      author: 'Test Author',
      tags: ['test']
    }).then((bookResponse) => {
      const bookId = bookResponse.body._id

      cy.addMember({ firstName: 'First', lastName: 'Member' }).then((m1) => {
        cy.addMember({ firstName: 'Second', lastName: 'Member' }).then((m2) => {
          cy.request('POST', `${Cypress.env('apiUrl')}/books/${bookId}/lend`, {
            memberId: m1.body._id
          })

          cy.reload()

          cy.contains(bookTitle).parent().parent().parent().within(() => {
            cy.contains('Waitlist').click()
          })

          cy.get('select').select('Second Member')
          cy.contains('button', 'Confirm').click()
          cy.wait(1000)

          cy.contains(bookTitle).parent().parent().parent().within(() => {
            cy.contains('Waitlist: 1').should('be.visible')
          })

          cy.contains(bookTitle).parent().parent().parent().within(() => {
            cy.contains('Take Back').click()
          })
          cy.wait(1000)

          cy.reload()
          cy.contains(bookTitle).parent().parent().parent().within(() => {
            cy.contains('BORROWED').should('be.visible')
            cy.contains('Waitlist').should('not.exist')
          })
        })
      })
    })
  })

  it('Multiple books lending workflow', () => {
    const books = [
      { title: `Multi Book 1 ${Date.now()}`, author: 'Author 1' },
      { title: `Multi Book 2 ${Date.now()}`, author: 'Author 2' },
      { title: `Multi Book 3 ${Date.now()}`, author: 'Author 3' }
    ]

    books.forEach(book => {
      cy.addBook({ ...book, tags: ['test'] })
    })

    cy.addMember({ firstName: 'Multi', lastName: 'Borrower' }).then((member) => {
      const memberId = member.body._id

      cy.reload()

      books.forEach((book, index) => {
        cy.contains(book.title).parent().parent().parent().within(() => {
          cy.contains('Lend Book').click()
        })

        cy.get('select').select('Multi Borrower')
        cy.contains('button', 'Confirm').click()
        cy.wait(1000)
      })

      cy.contains('Members').click()
      cy.contains('Multi').parent().parent().parent().within(() => {
        cy.get('[class*="bg-blue-50"]').should('have.length', 3)
      })
    })
  })

  it('Search and delete workflow', () => {
    const searchTerm = `SearchDelete${Date.now()}`
    
    cy.addBook({
      title: `${searchTerm} Book One`,
      author: 'Test',
      tags: ['test']
    })
    cy.addBook({
      title: `${searchTerm} Book Two`,
      author: 'Test',
      tags: ['test']
    })

    cy.reload()

    cy.get('input[placeholder="Search local library..."]').type(searchTerm)
    cy.wait(500)

    cy.get('[class*="grid"] > div').should('have.length.at.least', 2)

    cy.get('[class*="grid"] > div').first().trigger('mouseover')
    cy.get('button[title="Delete book"]').first().click({ force: true })
    cy.wait(1000)

    cy.get('[class*="grid"] > div').should('have.length', 1)
  })

  it('Populate library workflow', () => {
    cy.contains('Populate Library').click()
    cy.contains('Python').click()
    cy.wait(3000)

    cy.get('[class*="grid"] > div').should('have.length.greaterThan', 0)

    cy.get('[class*="grid"] > div').first().within(() => {
      cy.contains('button', 'Add').click()
    })

    cy.wait(2000)

    cy.get('[class*="grid"] > div').first().within(() => {
      cy.contains('Added').should('be.visible')
    })
  })

  it('Reports generation workflow', () => {
    const bookTitle = `Report Book ${Date.now()}`
    
    cy.addBook({
      title: bookTitle,
      author: 'Test Author',
      tags: ['test']
    }).then((bookResponse) => {
      const bookId = bookResponse.body._id

      cy.addMember({ firstName: 'Report', lastName: 'Member' }).then((memberResponse) => {
        const memberId = memberResponse.body._id

        cy.request('POST', `${Cypress.env('apiUrl')}/books/${bookId}/lend`, {
          memberId: memberId
        })

        cy.contains('Reports').click()
        cy.wait(1000)

        cy.contains('Library Reports').should('be.visible')
        cy.contains('Overdue Books').should('be.visible')
        cy.contains('Top').should('exist')
      })
    })
  })

  it('Form validation workflow', () => {
    cy.contains('Add Manual').click()
    cy.contains('button', 'Save').click()
    
    cy.get('input[placeholder="Title"]:invalid').should('exist')
    cy.get('input[placeholder="Author"]:invalid').should('exist')

    cy.contains('Members').click()
    cy.contains('button', 'Add Member').click()
    cy.contains('button', 'Save Member').click()

    cy.get('input[placeholder="First Name"]:invalid').should('exist')
    cy.get('input[placeholder="Last Name"]:invalid').should('exist')
  })

  it('Navigation persistence workflow', () => {
    cy.contains('Members').click()
    cy.url().should('include', '/members')

    cy.reload()
    cy.url().should('include', '/members')

    cy.contains('Reports').click()
    cy.url().should('include', '/reports')

    cy.go('back')
    cy.url().should('include', '/members')
  })
})

describe('Edge Cases and Error Handling', () => {
  it('should handle adding duplicate book', () => {
    const duplicateTitle = `Duplicate ${Date.now()}`
    
    cy.addBook({
      title: duplicateTitle,
      author: 'Test',
      tags: ['test']
    })

    cy.visit('/')
    cy.contains('Add Manual').click()
    cy.get('input[placeholder="Title"]').type(duplicateTitle)
    cy.get('input[placeholder="Author"]').type('Test')
    cy.contains('button', 'Save').click()
    cy.wait(500)
  })

  it('should handle lending without selecting member', () => {
    cy.visit('/')
    cy.contains('AVAILABLE').parent().parent().parent().within(() => {
      cy.contains('Lend Book').first().click()
    })
    cy.contains('button', 'Confirm').click()
  })

  it('should handle empty search results', () => {
    cy.visit('/')
    cy.get('input[placeholder="Search local library..."]').type('xyznonexistentbook')
    cy.wait(500)
    cy.get('[class*="grid"] > div').should('have.length', 0)
  })

  it('should handle network errors gracefully', () => {
    cy.intercept('GET', '**/books/getBooks', {
      statusCode: 500,
      body: { message: 'Server error' }
    }).as('getBooksFail')

    cy.visit('/')
    cy.wait('@getBooksFail')
  })
})

describe('Performance and Stress Tests', () => {
  it('should handle rapid navigation', () => {
    cy.visit('/')
    cy.contains('Members').click()
    cy.contains('Reports').click()
    cy.contains('Catalog').click()
    cy.contains('Members').click()
    cy.contains('Catalog').click()
    
    cy.contains('Library Catalog').should('be.visible')
  })

  it('should handle multiple books in catalog', () => {
    const books = Array.from({ length: 10 }, (_, i) => ({
      title: `Stress Test Book ${i} ${Date.now()}`,
      author: `Author ${i}`,
      tags: ['stress', 'test']
    }))

    books.forEach(book => cy.addBook(book))

    cy.visit('/')
    cy.wait(2000)
    cy.get('[class*="grid"] > div').should('have.length.at.least', 10)
  })
})
