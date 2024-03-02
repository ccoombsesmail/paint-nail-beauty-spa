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




  it('Should create be able to transfer a Silver Membership With Sub account to a NonMember', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })

    cy.createGoldOrSilverWithSubCustomer('Silver', 'Member', 'silvermember@example.com', 'Silver')

    cy.wait(1000)
    cy.get('.customer-edit-btn').eq(0).click({ force: true })
    cy.get('.p-panel-content').eq(1).within(() => {
      cy.get('.p-dropdown-trigger').first().click({ force: true });
    })
    cy.get('.p-dropdown-items .p-dropdown-item').contains('Bronze').should('have.class', 'p-disabled');
    cy.get('.p-dropdown-items .p-dropdown-item').contains('Non Member').should('have.class', 'p-disabled');
    cy.get('.p-dropdown-items .p-dropdown-item').contains('Gold (Non Active)').should('have.class', 'p-disabled');
    cy.get('.p-dropdown-items .p-dropdown-item').contains('Silver (Non Active)').should('have.class', 'p-disabled');
    cy.get('.p-dropdown-items .p-dropdown-item').contains('Bronze (Non Active)').should('have.class', 'p-disabled');
    cy.get('.p-dropdown-items .p-dropdown-item').contains('Gold').click({ force: true });
    cy.get('#cy-membership-update-btn').click({ force: true })
    cy.get('.cy-membership-update-confirm-popup').first().within(() => {
      cy.get('.p-confirm-popup-accept').click({ force: true })
    })
  })


  it('After transferring Silver Membership with Sub Account to Non Member, New Member Should Have Silver Membership with Sub Account. Customers Table should reflect this', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('tr').eq(1).contains('Gold')

  })

  //
  // it('Member who receives membership transfer should not be able to add a sub account, and existing sub account should be transferred under new member', () => {
  //   cy.visit('http://localhost:3000', {
  //     failOnStatusCode: false
  //   })
  //   cy.get('.customer-edit-btn').eq(1).click({force: true})
  //
  //   cy.get('.p-panel-content').eq(0).within(() => {
  //     cy.get('[name="email"]').should('have.value', 'Silver.Member.SubAccount@example.com')
  //     cy.get('button').should('not.exist')
  //   })
  //
  // })

})
