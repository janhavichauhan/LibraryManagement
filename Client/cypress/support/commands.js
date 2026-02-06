Cypress.Commands.add('login', () => {
  cy.visit('/')
})

Cypress.Commands.add('addBook', (bookData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/books/addBook`,
    body: bookData,
    failOnStatusCode: false
  })
})

Cypress.Commands.add('addMember', (memberData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/members/addMember`,
    body: memberData,
    failOnStatusCode: false
  })
})

Cypress.Commands.add('deleteAllBooks', () => {
  cy.request('GET', `${Cypress.env('apiUrl')}/books/getBooks`).then((response) => {
    response.body.forEach((book) => {
      if (book.status === 'AVAILABLE') {
        cy.request({
          method: 'DELETE',
          url: `${Cypress.env('apiUrl')}/books/${book._id}`,
          failOnStatusCode: false
        })
      }
    })
  })
})
