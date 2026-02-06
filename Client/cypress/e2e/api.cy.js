describe('API - Books Endpoints', () => {
  const apiUrl = Cypress.env('apiUrl')

  it('GET /books/getBooks - should fetch all books', () => {
    cy.request('GET', `${apiUrl}/books/getBooks`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
    })
  })

  it('POST /books/addBook - should add a new book', () => {
    const newBook = {
      title: `API Test Book ${Date.now()}`,
      author: 'API Test Author',
      tags: ['test', 'api'],
      coverImage: ''
    }

    cy.request('POST', `${apiUrl}/books/addBook`, newBook).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('title', newBook.title)
      expect(response.body).to.have.property('author', newBook.author)
      expect(response.body).to.have.property('_id')
    })
  })

  it('POST /books/addBook - should reject duplicate titles', () => {
    const duplicateTitle = `Duplicate API Test ${Date.now()}`
    
    cy.request('POST', `${apiUrl}/books/addBook`, {
      title: duplicateTitle,
      author: 'Test',
      tags: ['test']
    })

    cy.request({
      method: 'POST',
      url: `${apiUrl}/books/addBook`,
      body: {
        title: duplicateTitle,
        author: 'Test2',
        tags: ['test']
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.message).to.include('already exists')
    })
  })

  it('DELETE /books/:bookId - should delete an available book', () => {
    cy.request('POST', `${apiUrl}/books/addBook`, {
      title: `Delete Test ${Date.now()}`,
      author: 'Test',
      tags: ['test']
    }).then((addResponse) => {
      const bookId = addResponse.body._id

      cy.request('DELETE', `${apiUrl}/books/${bookId}`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.message).to.include('deleted successfully')
      })
    })
  })

  it('DELETE /books/:bookId - should not delete borrowed book', () => {
    let bookId, memberId

    cy.request('POST', `${apiUrl}/books/addBook`, {
      title: `Borrowed Book ${Date.now()}`,
      author: 'Test',
      tags: ['test']
    }).then((bookResponse) => {
      bookId = bookResponse.body._id

      cy.request('POST', `${apiUrl}/members/addMember`, {
        firstName: 'Test',
        lastName: 'User'
      }).then((memberResponse) => {
        memberId = memberResponse.body._id

        cy.request('POST', `${apiUrl}/books/${bookId}/lend`, {
          memberId: memberId
        }).then(() => {
          cy.request({
            method: 'DELETE',
            url: `${apiUrl}/books/${bookId}`,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(400)
            expect(response.body.message).to.include('Cannot delete')
          })
        })
      })
    })
  })
})

describe('API - Lending and Returning', () => {
  const apiUrl = Cypress.env('apiUrl')
  let bookId, memberId

  beforeEach(() => {
    cy.request('POST', `${apiUrl}/books/addBook`, {
      title: `Lending API Test ${Date.now()}`,
      author: 'Test Author',
      tags: ['test']
    }).then((response) => {
      bookId = response.body._id
    })

    cy.request('POST', `${apiUrl}/members/addMember`, {
      firstName: 'John',
      lastName: 'Doe'
    }).then((response) => {
      memberId = response.body._id
    })
  })

  it('POST /books/:bookId/lend - should lend a book', () => {
    cy.request('POST', `${apiUrl}/books/${bookId}/lend`, {
      memberId: memberId
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.include('borrowed successfully')
    })
  })

  it('POST /books/:bookId/lend - should add to waitlist if borrowed', () => {
    cy.request('POST', `${apiUrl}/books/${bookId}/lend`, {
      memberId: memberId
    })

    cy.request('POST', `${apiUrl}/members/addMember`, {
      firstName: 'Jane',
      lastName: 'Smith'
    }).then((response) => {
      const secondMemberId = response.body._id

      cy.request('POST', `${apiUrl}/books/${bookId}/lend`, {
        memberId: secondMemberId
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.message).to.include('waitlist')
      })
    })
  })

  it('POST /books/:bookId/return - should return a book', () => {
    cy.request('POST', `${apiUrl}/books/${bookId}/lend`, {
      memberId: memberId
    })

    cy.request('POST', `${apiUrl}/books/${bookId}/return`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.exist
    })
  })
})

describe('API - Members Endpoints', () => {
  const apiUrl = Cypress.env('apiUrl')

  it('GET /members/getMembers - should fetch all members', () => {
    cy.request('GET', `${apiUrl}/members/getMembers`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
    })
  })

  it('POST /members/addMember - should add a new member', () => {
    const newMember = {
      firstName: `TestFirst${Date.now()}`,
      lastName: `TestLast${Date.now()}`
    }

    cy.request('POST', `${apiUrl}/members/addMember`, newMember).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('firstName', newMember.firstName)
      expect(response.body).to.have.property('lastName', newMember.lastName)
      expect(response.body).to.have.property('_id')
      expect(response.body).to.have.property('activeLoans').that.is.an('array')
    })
  })
})

describe('API - Reports Endpoints', () => {
  const apiUrl = Cypress.env('apiUrl')

  it('GET /reports/overdue - should fetch overdue books', () => {
    cy.request('GET', `${apiUrl}/reports/overdue`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
    })
  })

  it('GET /reports/top-books - should fetch top books', () => {
    cy.request('GET', `${apiUrl}/reports/top-books`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      expect(response.body.length).to.be.at.most(5)
    })
  })
})

describe('API - Error Handling', () => {
  const apiUrl = Cypress.env('apiUrl')

  it('should return 404 for non-existent book', () => {
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/books/000000000000000000000000`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404)
    })
  })

  it('should return 404 for non-existent member in lending', () => {
    cy.request('POST', `${apiUrl}/books/addBook`, {
      title: `Error Test ${Date.now()}`,
      author: 'Test',
      tags: ['test']
    }).then((response) => {
      const bookId = response.body._id

      cy.request({
        method: 'POST',
        url: `${apiUrl}/books/${bookId}/lend`,
        body: { memberId: '000000000000000000000000' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
      })
    })
  })
})
