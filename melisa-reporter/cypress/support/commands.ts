// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with test credentials
       * @example cy.login()
       */
      login(): Chainable<void>

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>

      /**
       * Custom command to reset test database
       * @example cy.resetDatabase()
       */
      resetDatabase(): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.visit('/login');
  cy.get('[data-testid="email"]').type('test@example.com');
  cy.get('[data-testid="password"]').type('password123');
  cy.get('[data-testid="submit"]').click();
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout"]').click();
});

Cypress.Commands.add('resetDatabase', () => {
  cy.request('POST', 'http://localhost:8080/api/test/reset');
});