import "../../support/commands";

describe('CustomerPage', () => {
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
    })

    cy.createBronzeMember('Bronze', 'Member', 'goldmember@example.com', 'Nail')
    cy.wait(1000)

    cy.get('.customer-edit-btn').eq(0).click({ force: true })
    cy.get('form').eq(0).within(() => {
      cy.get('[name="firstName"]').clear()
      cy.get('[name="firstName"]').type("new firstName");

      cy.get('[name="lastName"]').clear();
      cy.get('[name="lastName"]').type("new lastName");

      cy.get('[name="email"]').clear();
      cy.get('[name="email"]').type("newemail@example.com");

      cy.get('[name="phoneNumber"]').clear();
      cy.get('[name="phoneNumber"]').type("0000000000");

      cy.get('[name="notes"]').clear();
      cy.get('[name="notes"]').type("some notes");
    })
    cy.get('form').first().submit();

    cy.get('form').eq(0).within(() => {

      cy.get('[name="firstName"]').should('have.value', "new firstName");
      cy.get('[name="lastName"]').should('have.value', "new lastName");
      cy.get('[name="email"]').should('have.value', "newemail@example.com");
      cy.get('[name="phoneNumber"]').should('have.value', "(000) 000-0000");
      cy.get('[name="notes"]').should('have.value', "some notes");

    })

  })




  //
  // it('After updating Bronze Membership to Gold, Customers Table should reflect the update', () => {
  //   cy.visit('http://localhost:3000', {
  //     failOnStatusCode: false
  //   })
  //   cy.get('tr').eq(1).contains('Gold')
  //
  // })


})
