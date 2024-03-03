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

    it('Should create be able to transfer a Gold Membership With Sub account to a NonMember', () => {
      cy.visit('http://localhost:3000', {
        failOnStatusCode: false
      })
      cy.createNonMemberCustomer('Non', 'Member', 'nonmember@example.com');
      cy.createGoldOrSilverWithSubCustomer('Gold', 'Member', 'goldmember@example.com', 'Gold')

      cy.get('.customer-edit-btn').eq(0).click({force: true})
      cy.get('#cy-transfer-membership-to-input').type('non')
      cy.wait(400)
      cy.get('.p-autocomplete-item').first().click({ force: true })
      cy.get('#cy-membership-transfer-btn').click({ force: true })
      cy.get('.transfer-membership-confirm-popup').first().within(() => {
        cy.get('.p-confirm-popup-accept').click({ force: true })
      })
      cy.get('.p-panel-content').eq(0).contains('Only Activated Silver Or Gold Members Can Add Sub Accounts')
      cy.get('.p-panel-content').eq(1).contains('Not A Member')
      cy.get('.p-panel-content').eq(2).contains('Only Activated Silver Or Gold Members Can Transfer Their Membership')
      cy.get('.p-panel-content').eq(3).contains('Only Activated Gold Members Can Transfer Their Cashback Balance')
    })

  it('After transferring Gold Membership with Sub Account to Non Member, New Member Should Have Gold Membership with Sub Account. Customers Table should reflect this', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('tr').eq(1).contains('Non Member')
    cy.get('tr').eq(2).contains('Gold')
    cy.get('.p-row-toggler').first().click({force: true})
    cy.get('tr').eq(5).contains('Gold.Member.SubAccount@example.com')


  })

  it('Member who receives membership transfer should not be able to add a sub account, and existing sub account should be transferred under new member', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('.customer-edit-btn').eq(1).click({force: true})

    cy.get('.p-panel-content').eq(0).within(() => {
      cy.get('[name="email"]').should('have.value', 'Gold.Member.SubAccount@example.com')
      cy.get('button').should('not.exist')
    })

  })
})
