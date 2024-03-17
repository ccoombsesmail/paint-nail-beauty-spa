/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
// Ignore specific hydration-related errors in all tests

// 1. Disable Cypress uncaught exception failures from React hydration errors

export function genPhoneNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Hydration failed')) {
    // Returning false here prevents Cypress from failing the test
    return false;
  }
  if (err.message.includes('Minified React error')) {
    return  false
  }
});
Cypress.Commands.add(`signOut`, () => {
  cy.log(`sign out by clearing all cookies.`);
  cy.clearCookies({ domain: null });
});

Cypress.Commands.add(`signIn`, () => {
  cy.log(`Signing in.`);
  cy.visit(`/`, {
    failOnStatusCode: false
  });

  cy.window()
    .should((window) => {
      expect(window).to.not.have.property(`Clerk`, undefined);
      expect(window.Clerk.isReady()).to.eq(true);
    })
    .then(async (window) => {
      await cy.clearCookies({ domain: window.location.domain });
      const res = await window.Clerk.client.signIn.create({
        identifier: 'nbaldingf@sun.com',
        password: '12345678',
      });

      await window.Clerk.setActive({
        session: res.createdSessionId,
      });

      cy.log(`Finished Signing in.`);
    });
});


Cypress.Commands.add('tests_cleanup', () => {
  cy.task("clearDB")
})


Cypress.Commands.add('createNonMemberCustomer', (firstName, lastName, email) => {

  cy.get('#cy-create-customer-btn').click();

  cy.get('[name="firstName"]').type(firstName);
  cy.get('[name="lastName"]').type(lastName);
  cy.get('[name="email"]').type(email);
  cy.get('[name="phoneNumber"]').type(genPhoneNumber());

  // Select country code
  cy.get('.p-dialog').within(() => {
    cy.get('.p-dropdown-trigger').first().click({ force: true });
  });
  cy.get('.p-dropdown-items .p-dropdown-item').contains('United States').click({ force: true });

  // Select Membership
  cy.get('.p-dialog').within(() => {
    cy.get('.p-dropdown-trigger').eq(1).click({ force: true });
  });
  cy.get('.p-dropdown-items .p-dropdown-item').contains("Non Member").click({ force: true });

  cy.get('form').submit();
  cy.wait(1000);
});


Cypress.Commands.add('createBronzeMember', (firstName, lastName, email, serviceSelection) => {
  cy.get('#cy-create-customer-btn').click();

  cy.get('[name="firstName"]').type(firstName);
  cy.get('[name="lastName"]').type(lastName);
  cy.get('[name="email"]').type(email);
  cy.get('[name="phoneNumber"]').type(genPhoneNumber());

  // Select country code
  cy.get('.p-dialog').within(() => {
    cy.get('.p-dropdown-trigger').first().click({ force: true });
  });
  cy.get('.p-dropdown-items .p-dropdown-item').contains('United States').click({ force: true });

  // Select Membership
  cy.get('.p-dialog').within(() => {
    cy.get('.p-dropdown-trigger').eq(1).click({ force: true });
  });
  cy.get('.p-dropdown-items .p-dropdown-item').contains("Bronze").click({ force: true });

  cy.get('.p-dialog').within(() => {
    cy.get('.p-dropdown-trigger').eq(2).click({ force: true });
  });
  cy.get('.p-dropdown-items .p-dropdown-item').contains(serviceSelection).click({ force: true });

  cy.get('form').submit();
  cy.wait(100);
});

Cypress.Commands.add('createGoldOrSilverWithSubCustomer', (firstName, lastName, email, membershipLevel) => {
  cy.get('#cy-create-customer-btn').click();


  cy.get('[name="firstName"]').type(firstName);
  cy.get('[name="lastName"]').type(lastName);
  cy.get('[name="email"]').type(email);
  cy.get('[name="phoneNumber"]').type(genPhoneNumber());

  cy.get('.p-dialog').within(() => {
    cy.get('.p-dropdown-trigger').first().click({ force: true });
  })
  cy.get('.p-dropdown-items .p-dropdown-item').contains('United States').click({ force: true }); // Select a country code


  cy.get('.p-dialog').within(() => {
    cy.get('.p-dropdown-trigger').eq(1).click({ force: true });
  })
  cy.get('.p-dropdown-items .p-dropdown-item').contains(membershipLevel).click({ force: true }); // Select a membership level

  cy.get('.p-dialog').within(() => {
    cy.get('#cy-add-sub-account-btn').click({ force: true });

    cy.get('[name="subAccountInfo.firstName"]').type(`${firstName}-SubAccount`);
    cy.get('[name="subAccountInfo.lastName"]').type(`${lastName}-SubAccount`);
    cy.get('[name="subAccountInfo.email"]').type(`${firstName}.${lastName}.SubAccount@example.com`);
    cy.get('[name="subAccountInfo.phoneNumber"]').type(genPhoneNumber());
    cy.get('.p-dropdown-trigger').eq(2).wait(1000).click({ force: true });


  })
  cy.get('.p-dropdown-items .p-dropdown-item').contains('United States').click({ force: true }); // Select a country code
  cy.get('form').submit(); // Or cy.get('button').contains('Submit').click();
  cy.wait(1000)
});

Cypress.Commands.add('createTransaction',
  (
    customerSearch,
    customer,
    technician,
    cashbackBalanceToUse = '0',
    serviceType = 'Hand Care',
    serviceDuration= '1.5',
    paymentMethod = 'Venmo',
    totalPrice = '400' ,
    discountedPrice = '300',
    actualCollected = '200',
    tip = '10'
  ) => {

    cy.get('#cy-create-transaction-btn').click({force: true});


    cy.get('[name="userEnteredDate"]').click({force: true});
    cy.get('.p-datepicker-buttonbar').within(() => {
      cy.get('button').first().click({force: true})
    })
    cy.get('#cy-customer-search-select').click({ force : true})
    cy.get('#cy-customer-search-select').type(customerSearch)
    cy.wait(2000)
    cy.get('.p-autocomplete-item').contains(customer).click({ force: true })

    cy.get('#cy-technician-search-select').type(technician)
    cy.wait(2000)
    cy.get('.p-autocomplete-item').contains(technician).click({ force: true })

    cy.get('.p-dialog').within(() => {
      cy.get('.p-dropdown-trigger').first().click({ force: true });
    })
    cy.get('.p-dropdown-items .p-dropdown-item').contains(serviceType).click({ force: true });


    cy.get('[name="serviceDuration"]').type(serviceDuration);

    cy.get('.p-dialog').within(() => {
      cy.get('.p-dropdown-trigger').eq(1).click({ force: true });
    })
    cy.get('.p-dropdown-items .p-dropdown-item').contains(paymentMethod).click({ force: true });

    cy.get('[name="totalServicePrice"]').type(totalPrice);
    cy.get('[name="discountedServicePrice"]').type(discountedPrice);
    cy.get('[name="actualPaymentCollected"]').type(actualCollected);
    cy.get('[name="tip"]').type(tip);
    cy.get('[name="cashbackBalanceToUse"]').type(cashbackBalanceToUse);
    cy.get('form').submit()
});

Cypress.Commands.add('checkCashbackBalanceToUse',
  (
    customerSearch,
    customer,
    expectedCashbackBalanceToUse,
  ) => {

    cy.get('#cy-create-transaction-btn').click({force: true});

    cy.get('#cy-customer-search-select').type(customerSearch)
    cy.wait(2000)
    cy.get('.p-autocomplete-item').contains(customer).click({ force: true })

    cy.get('.p-dialog').within(() => {
      cy.get('#cy-available-cashback-balance').contains(`Available Balance: ${expectedCashbackBalanceToUse}`)
    })
  });

export {};
