# Automated Testing with Jest

This directory contains the automated testing setup for the GetPay backend using Jest.

## Overview

The testing framework is configured with:
- **Jest** as the test runner
- **Supertest** for HTTP assertions
- **MongoDB Memory Server** for isolated database testing
- **Coverage reporting** with detailed metrics

## Directory Structure

```
tests/
├── setup.js              # Global test setup and teardown
├── controllers/          # Controller unit tests
├── models/               # Model tests
├── routes/               # API integration tests
├── utils/                # Utility function tests
└── README.md            # This file
```

## Available Scripts

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:verbose` - Run tests with detailed output

## Writing Tests

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Focus on business logic

### Integration Tests
- Test API endpoints
- Test database operations
- Test middleware functionality

### Model Tests
- Test schema validation
- Test model methods
- Test database constraints

## Test Database

Tests use a separate MongoDB database (`getpay_test`) to avoid affecting production data. The database is cleaned between tests.

## Coverage

The test suite is configured to collect coverage from:
- Controllers
- Routes
- Middleware
- Utilities

Coverage reports are generated in the `coverage/` directory.

## Best Practices

1. **Test Naming**: Use descriptive test names
2. **Test Structure**: Arrange-Act-Assert pattern
3. **Mocking**: Mock external services and dependencies
4. **Database**: Use test database for isolation
5. **Assertions**: Use specific assertions over generic ones

## Example Test

```javascript
describe('Feature Name', () => {
  it('should do something specific', async () => {
    // Arrange
    const input = { name: 'Test' };
    
    // Act
    const result = await someFunction(input);
    
    // Assert
    expect(result).toHaveProperty('name', 'Test');
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- authController.test.js
```

## Troubleshooting

1. **Database Connection Issues**: Ensure MongoDB is running
2. **Port Conflicts**: Check if test port is available
3. **Environment Variables**: Set required environment variables
4. **Dependencies**: Run `npm install` to install test dependencies
