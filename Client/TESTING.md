# Cypress E2E Testing Guide

## Overview

This project includes comprehensive end-to-end (E2E) tests using Cypress to ensure all functionality works correctly. The test suite covers catalog management, member operations, lending/returning flows, navigation, and API endpoints.

## Test Structure

```
cypress/
├── e2e/
│   ├── api.cy.js           # API endpoint tests
│   ├── catalog.cy.js       # Book catalog tests
│   ├── members.cy.js       # Member management tests
│   ├── navigation.cy.js    # Navigation & UI tests
│   └── reports.cy.js       # Reports page tests
├── fixtures/
│   └── testData.json       # Test data fixtures
└── support/
    ├── commands.js         # Custom Cypress commands
    └── e2e.js             # Support file
```

## Test Coverage

### 1. Catalog Tests (`catalog.cy.js`)
- Display catalog page elements
- Add books manually
- Search functionality
- Open Library API integration
- Book deletion
- Lending flow
- Waitlist management

### 2. Members Tests (`members.cy.js`)
- Display members page
- Add new members
- View member profiles
- Active loans display
- Take back books from members
- Status badges

### 3. Reports Tests (`reports.cy.js`)
- Overdue books display
- Top books display
- Reports layout

### 4. Navigation Tests (`navigation.cy.js`)
- Page navigation
- Sidebar functionality
- Active state highlighting
- Toast notifications
- Responsive design
- Search functionality

### 5. API Tests (`api.cy.js`)
- Books endpoints (CRUD operations)
- Lending and returning
- Members endpoints
- Reports endpoints
- Error handling
- Validation

## Prerequisites

Before running tests, ensure:

1. **MongoDB is running**:
   ```bash
   mongod
   ```

2. **Backend server is running**:
   ```bash
   cd Server
   npm run dev
   ```

3. **Frontend is running**:
   ```bash
   cd Client
   npm run dev
   ```

## Running Tests

### Interactive Mode (Cypress UI)

Open Cypress Test Runner:

```bash
cd Client
npm run cypress:open
```

This will:
1. Open the Cypress Test Runner
2. Allow you to select and run individual tests
3. Show live test execution in a browser
4. Enable time-travel debugging

### Headless Mode (CI/CD)

Run all tests in headless mode:

```bash
npm test
```

Or:

```bash
npm run cypress:run
```

### Run with headed browser:

```bash
npm run test:headed
```

### Run in specific browser:

```bash
npm run test:chrome
npm run test:firefox
```

## Custom Commands

The test suite includes custom Cypress commands defined in `cypress/support/commands.js`:

### `cy.login()`
Navigates to the home page.

```javascript
cy.login()
```

### `cy.addBook(bookData)`
Directly adds a book via API.

```javascript
cy.addBook({
  title: 'Test Book',
  author: 'Test Author',
  tags: ['fiction'],
  coverImage: ''
})
```

### `cy.addMember(memberData)`
Directly adds a member via API.

```javascript
cy.addMember({
  firstName: 'John',
  lastName: 'Doe'
})
```

### `cy.deleteAllBooks()`
Deletes all available books (used for cleanup).

```javascript
cy.deleteAllBooks()
```

## Test Data

Test fixtures are stored in `cypress/fixtures/testData.json`:

```javascript
cy.fixture('testData').then((data) => {
  const book = data.testBooks[0]
  cy.addBook(book)
})
```

## Configuration

Configuration is in `cypress.config.js`:

```javascript
{
  e2e: {
    baseUrl: "http://localhost:5173",    // Frontend URL
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,                         // Disable video recording
    screenshotOnRunFailure: true,         // Screenshots on failures
    env: {
      apiUrl: "http://localhost:5000/api" // Backend API URL
    }
  }
}
```

### Environment Variables

You can override settings via environment variables:

```bash
CYPRESS_BASE_URL=http://localhost:3000 npm test
```

Or via `cypress.env.json`:

```json
{
  "apiUrl": "http://localhost:5000/api",
  "baseUrl": "http://localhost:5173"
}
```

## Best Practices

### 1. Test Isolation
Each test should be independent and not rely on previous tests.

```javascript
beforeEach(() => {
  cy.visit('/')
})
```

### 2. Selectors
Use data attributes for stable selectors:

```javascript
cy.get('[data-testid="add-book-btn"]').click()
```

Or use semantic selectors:

```javascript
cy.contains('Add Book').click()
```

### 3. Waiting
Use Cypress's built-in retry-ability instead of hard waits:

```javascript
cy.contains('Book added', { timeout: 10000 }).should('be.visible')
```

### 4. API Tests
Test API endpoints directly for faster execution:

```javascript
cy.request('POST', `${Cypress.env('apiUrl')}/books/addBook`, bookData)
```

### 5. Cleanup
Clean up test data in `after` or `afterEach` hooks:

```javascript
after(() => {
  cy.deleteAllBooks()
})
```

## Debugging Tests

### 1. Time Travel
Click on commands in Cypress UI to see DOM snapshots.

### 2. Console Logs
Use `cy.log()` for debugging:

```javascript
cy.log('Testing book addition')
```

### 3. Pause Execution
Add `.debug()` or `.pause()`:

```javascript
cy.get('button').debug().click()
cy.pause()
```

### 4. Screenshots
Take screenshots manually:

```javascript
cy.screenshot('book-catalog')
```

## Continuous Integration

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/cypress.yml`):

```yaml
name: Cypress Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start MongoDB
        uses: supercharge/mongodb-github-action@1.10.0
      - name: Install Server Dependencies
        run: cd Server && npm install
      - name: Start Server
        run: cd Server && npm start &
      - name: Install Client Dependencies
        run: cd Client && npm install
      - name: Run Cypress Tests
        uses: cypress-io/github-action@v6
        with:
          working-directory: Client
          start: npm run dev
          wait-on: 'http://localhost:5173'
```

## Troubleshooting

### Tests Fail to Start

1. **Check if servers are running**:
   ```bash
   curl http://localhost:5000/api/books/getBooks
   curl http://localhost:5173
   ```

2. **Check MongoDB connection**:
   ```bash
   mongosh
   ```

3. **Clear Cypress cache**:
   ```bash
   npx cypress cache clear
   npx cypress install
   ```

### Timeouts

Increase timeout in specific tests:

```javascript
cy.get('.element', { timeout: 10000 }).should('be.visible')
```

Or globally in `cypress.config.js`:

```javascript
{
  defaultCommandTimeout: 10000
}
```

### Port Conflicts

If ports are in use, update `.env` files and `cypress.config.js`.

### Flaky Tests

1. Add proper waits for API calls
2. Use `cy.intercept()` to stub network requests
3. Ensure proper cleanup between tests

## Writing New Tests

### Template

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/page')
  })

  it('should perform action', () => {
    cy.get('selector').click()
    cy.contains('Expected Text').should('be.visible')
  })

  after(() => {
    // Cleanup
  })
})
```

### Assertions

```javascript
// Visibility
cy.get('.element').should('be.visible')
cy.get('.element').should('not.exist')

// Content
cy.contains('Text').should('exist')
cy.get('.element').should('have.text', 'Expected')

// Attributes
cy.get('input').should('have.value', 'test')
cy.get('button').should('be.disabled')

// Length
cy.get('.items').should('have.length', 5)

// Classes
cy.get('.element').should('have.class', 'active')
```

## Test Reports

### Mochawesome Reporter

Install and configure for HTML reports:

```bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
```

Update `cypress.config.js`:

```javascript
{
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: true,
    json: true
  }
}
```

## Performance

- Use API commands for setup instead of UI interactions
- Run tests in parallel (Cypress Dashboard)
- Skip video recording for faster execution
- Use `cy.intercept()` to mock slow API calls

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API](https://docs.cypress.io/api/table-of-contents)
- [Real World App Example](https://github.com/cypress-io/cypress-realworld-app)

---

**Happy Testing! 🧪✨**
