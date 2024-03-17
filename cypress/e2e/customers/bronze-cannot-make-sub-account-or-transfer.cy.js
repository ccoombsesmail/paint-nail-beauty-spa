import "../../support/commands";
import { genPhoneNumber } from '../../support/commands';

describe('Bronze Cannot Make Sub Account Or Transfer', () => {
  before(() => {
    cy.tests_cleanup()
  });

  beforeEach(() => {
    cy.session('signed-in', () => {
      cy.signIn();
    });
  })




  it('Should create be able to update a Bronze Membership to a Gold Membership', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.get('#cy-create-customer-btn').click();

    cy.get('[name="firstName"]').type("firstName");
    cy.get('[name="lastName"]').type("lastName");
    cy.get('[name="email"]').type("email@example.com");
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
    cy.get('.p-dropdown-items .p-dropdown-item').contains("Facial").click({ force: true });

    cy.get('.p-dialog').within(() => {
      cy.get('#cy-add-sub-account-btn').should('not.exist');
    });

    cy.get('form').submit();
    cy.wait(100);


    cy.get('.customer-edit-btn').eq(0).click({ force: true })
    cy.wait(2000)
    cy.get('.p-panel-content').eq(0).within(() => {
      cy.get('.p-button-raised ').first().contains('Only Activated Silver Or Gold Members Can Add Sub Accounts');
    })

    cy.get('.p-panel-content').eq(2).within(() => {
      cy.get('.p-button-raised ').first().contains('Only Activated Silver Or Gold Members Can Transfer Their Membership');
    })

    cy.get('.p-panel-content').eq(3).within(() => {
      cy.get('.p-button-raised ').first().contains('Only Activated Gold Members Can Transfer Their Cashback Balance');
    })

  })


})
