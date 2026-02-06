describe('Members Page', () => {
  beforeEach(() => {
    cy.visit('/members')
  })

  it('should display the members page correctly', () => {
    cy.contains('Member Directory').should('be.visible')
    cy.contains('Manage members and their active loans').should('be.visible')
    cy.contains('Add Member').should('be.visible')
  })

  it('should display the members table', () => {
    cy.get('table').should('be.visible')
    cy.contains('Name').should('be.visible')
    cy.contains('Active Loans').should('be.visible')
    cy.contains('Status').should('be.visible')
  })

  it('should open add member modal', () => {
    cy.contains('button', 'Add Member').click()
    cy.contains('Add New Member').should('be.visible')
    cy.get('input[placeholder="First Name"]').should('be.visible')
    cy.get('input[placeholder="Last Name"]').should('be.visible')
  })

  it('should close add member modal', () => {
    cy.contains('button', 'Add Member').click()
    cy.contains('button', 'Cancel').click()
    cy.contains('Add New Member').should('not.exist')
  })

  it('should add a new member', () => {
    cy.contains('button', 'Add Member').click()
    
    const firstName = `TestFirst${Date.now()}`
    const lastName = `TestLast${Date.now()}`
    
    cy.get('input[placeholder="First Name"]').type(firstName)
    cy.get('input[placeholder="Last Name"]').type(lastName)
    
    cy.contains('button', 'Save Member').click()
    
    cy.contains(firstName, { timeout: 10000 }).should('be.visible')
    cy.contains(lastName).should('be.visible')
  })

  it('should display member initials in avatar', () => {
    cy.get('[class*="bg-blue-100"]').first().should('exist')
  })

  it('should show member ID', () => {
    cy.contains('ID:').should('exist')
  })

  it('should display active status badge', () => {
    cy.get('[class*="rounded-full"]').should('exist')
  })

  it('should show no books borrowed message for idle members', () => {
    cy.contains('No books borrowed').should('exist')
  })

  it('should display take back button for active loans', () => {
    cy.get('table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.get('table tbody tr').first().within(() => {
          cy.get('[class*="bg-blue-50"]').then(($loanCards) => {
            if ($loanCards.length > 0) {
              cy.contains('Take Back').should('exist')
            }
          })
        })
      }
    })
  })

  it('should show book title in active loans', () => {
    cy.get('table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.get('[class*="bg-blue-50"]').then(($loanCards) => {
          if ($loanCards.length > 0) {
            cy.get('[class*="bg-blue-50"]').first().within(() => {
              cy.get('span').should('exist')
            })
          }
        })
      }
    })
  })
})

describe('Member Loan Management', () => {
  let testMember
  let testBook

  before(() => {
    cy.addMember({
      firstName: 'Alice',
      lastName: 'Johnson'
    }).then((response) => {
      testMember = response.body
    })

    cy.addBook({
      title: `Member Test Book ${Date.now()}`,
      author: 'Test Author',
      tags: ['test']
    }).then((response) => {
      testBook = response.body
    })

  })

  beforeEach(() => {
    cy.visit('/members')
  })

  it('should display active loans for members', () => {
    cy.contains('Alice').should('be.visible')
  })

  it('should take back a book from member page', () => {
    cy.contains('Alice').parent().parent().parent().within(() => {
      cy.contains('Take Back').first().click({ force: true })
    })
    cy.wait(1000)
  })

  it('should update member status after taking back book', () => {
    cy.wait(500)
    cy.reload()
  })
})
