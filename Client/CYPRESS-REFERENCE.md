# Cypress Test Suite - Quick Reference

## 📋 Test Files Overview

### 1. **catalog.cy.js** (3 test suites, 18 tests)
Tests for book catalog management:
- ✅ Display catalog page
- ✅ Add/Delete books manually
- ✅ Search functionality
- ✅ Populate from Open Library
- ✅ Lend books
- ✅ Book deletion with validations

**Key Tests:**
```javascript
- should display the catalog page correctly
- should add a book manually
- should search for books
- should delete an available book
```

### 2. **members.cy.js** (3 test suites, 14 tests)
Tests for member management:
- ✅ Display members page
- ✅ Add new members
- ✅ View active loans
- ✅ Take back books
- ✅ Member status indicators

**Key Tests:**
```javascript
- should add a new member
- should display take back button for active loans
- should take back a book from member page
```

### 3. **reports.cy.js** (1 test suite, 5 tests)
Tests for reports functionality:
- ✅ Display overdue books
- ✅ Display top books
- ✅ Reports layout

**Key Tests:**
```javascript
- should display overdue books section
- should display top books section
```

### 4. **navigation.cy.js** (4 test suites, 19 tests)
Tests for navigation and UI:
- ✅ Page navigation
- ✅ Sidebar functionality
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Search functionality

**Key Tests:**
```javascript
- should navigate between pages using sidebar
- should show success toast when adding a book
- should display correctly on mobile/tablet/desktop
```

### 5. **api.cy.js** (4 test suites, 16 tests)
API endpoint tests:
- ✅ Books CRUD operations
- ✅ Lending/Returning
- ✅ Members operations
- ✅ Reports endpoints
- ✅ Error handling

**Key Tests:**
```javascript
- GET /books/getBooks - should fetch all books
- POST /books/addBook - should add a new book
- POST /books/:bookId/lend - should lend a book
- DELETE /books/:bookId - should delete an available book
```

### 6. **workflows.cy.js** (3 test suites, 13 tests)
Complete end-to-end workflows:
- ✅ Full lending workflow
- ✅ Waitlist workflow
- ✅ Multiple books lending
- ✅ Search and delete
- ✅ Edge cases and errors
- ✅ Performance tests

**Key Tests:**
```javascript
- Complete lending workflow: Add book → Add member → Lend → Return
- Waitlist workflow: Lend → Add to waitlist → Return → Auto-assign
- should handle adding duplicate book
```

## 📊 Total Test Coverage

| Category | Test Files | Test Suites | Test Cases |
|----------|-----------|-------------|------------|
| E2E Tests | 6 | 18 | 85+ |
| API Tests | 1 | 4 | 16 |
| UI Tests | 4 | 10 | 50+ |
| Workflows | 1 | 3 | 13 |
| Integration | All | All | 85+ |

## 🚀 Running Tests

### Quick Commands

```bash
# Open Cypress Test Runner (Interactive)
npm run cypress:open

# Run all tests (Headless)
npm test
npm run cypress:run

# Run with headed browser
npm run test:headed

# Run specific browser
npm run test:chrome
npm run test:firefox

# Run specific test file
npx cypress run --spec "cypress/e2e/catalog.cy.js"

# Run tests matching pattern
npx cypress run --spec "cypress/e2e/**/api.*.js"
```

### Prerequisites Checklist

Before running tests:

- [ ] MongoDB is running (`mongod`)
- [ ] Backend server is running (`cd Server && npm run dev`)
- [ ] Frontend is running (`cd Client && npm run dev`)
- [ ] All dependencies installed (`npm install` in both folders)

### Test Execution Order

1. **API Tests First** - Fastest, no UI
   ```bash
   npx cypress run --spec "cypress/e2e/api.cy.js"
   ```

2. **Individual Page Tests** - Isolated UI tests
   ```bash
   npx cypress run --spec "cypress/e2e/catalog.cy.js"
   npx cypress run --spec "cypress/e2e/members.cy.js"
   npx cypress run --spec "cypress/e2e/reports.cy.js"
   ```

3. **Navigation Tests** - Cross-page interactions
   ```bash
   npx cypress run --spec "cypress/e2e/navigation.cy.js"
   ```

4. **Workflow Tests** - Complete user journeys
   ```bash
   npx cypress run --spec "cypress/e2e/workflows.cy.js"
   ```

## 🎯 Test Scenarios

### Scenario 1: Book Management
```
catalog.cy.js
├── Add book manually ✓
├── Search books ✓
├── Populate from API ✓
└── Delete book ✓
```

### Scenario 2: Member Management
```
members.cy.js
├── Add member ✓
├── View members ✓
├── Active loans display ✓
└── Take back books ✓
```

### Scenario 3: Lending Flow
```
workflows.cy.js
├── Add book ✓
├── Add member ✓
├── Lend book ✓
├── Add to waitlist ✓
├── Return book ✓
└── Auto-assign from waitlist ✓
```

### Scenario 4: Reports
```
reports.cy.js
├── View overdue books ✓
└── View top books ✓
```

## 🔍 Custom Commands

```javascript
// Navigate to home
cy.login()

// Add book via API
cy.addBook({
  title: 'Test Book',
  author: 'Test Author',
  tags: ['test']
})

// Add member via API
cy.addMember({
  firstName: 'John',
  lastName: 'Doe'
})

// Clean up all books
cy.deleteAllBooks()
```

## 📈 Test Results

### Expected Pass Rate
- **Target**: 95%+ pass rate
- **Critical Tests**: 100% pass rate
- **Flaky Tests**: < 5%

### Performance Benchmarks
- **API Tests**: < 2 seconds per test
- **UI Tests**: < 5 seconds per test
- **Workflow Tests**: < 10 seconds per test
- **Full Suite**: < 5 minutes

## 🐛 Debugging Tests

### View Test in Browser
```bash
npm run cypress:open
# Click on test file to run in browser
```

### Debug Specific Test
```javascript
it('should do something', () => {
  cy.debug()  // Pause at this point
  cy.pause()  // Pause with manual resume
  cy.log('Debug info')  // Console log
})
```

### Screenshots and Videos
```bash
# Screenshots saved to: cypress/screenshots
# Videos saved to: cypress/videos
```

### Common Issues

**Issue**: Tests timeout
```bash
# Solution: Increase timeout
cy.get('.element', { timeout: 10000 })
```

**Issue**: Element not found
```bash
# Solution: Wait for element
cy.contains('Text', { timeout: 10000 }).should('be.visible')
```

**Issue**: Network errors
```bash
# Solution: Add API wait
cy.wait(1000)
```

## 📝 Test Checklist

Before committing code:

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Tests run in CI/CD
- [ ] No flaky tests
- [ ] Screenshots on failure
- [ ] Code coverage > 80%

## 🔗 Related Files

- **Config**: `cypress.config.js`, `cypress.env.json`
- **Commands**: `cypress/support/commands.js`
- **Fixtures**: `cypress/fixtures/testData.json`
- **CI/CD**: `.github/workflows/cypress.yml`
- **Documentation**: `TESTING.md`

## 📚 Resources

- [Cypress Docs](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Assertions](https://docs.cypress.io/guides/references/assertions)

---

**Test Coverage: 85+ Tests | 6 Test Files | 18 Test Suites** 🎉
