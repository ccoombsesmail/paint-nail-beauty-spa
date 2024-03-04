import "../../support/commands";

describe('Gold Member Can Transfer Cashback', () => {
  before(() => {
    cy.tests_cleanup()
  });

  beforeEach(() => {
    cy.session('signed-in', () => {
      cy.signIn();
    });
  })

  it('Gold Member should create be able to transfer cashback balance to any member only 1 time', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.createNonMemberCustomer('Non', 'Member', 'nonmember@example.com');
    cy.createGoldOrSilverWithSubCustomer('Gold', 'Member', 'goldmember@example.com', 'Gold')
    cy.get('nav').within(() => {
      cy.get('a').eq(1).click({force: true })
    })
    cy.createTransaction('Gold', 'Gold M.', 'Ninnetta');
    cy.wait(1000)

    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.wait(1000)
    cy.get('.customer-edit-btn').eq(0).click({force: true})
    cy.get('#cy-transfer-balance-to-input').type('non')
    cy.wait(400)
    cy.get('.p-autocomplete-item').first().click({ force: true })
    cy.get('#cy-balance-transfer-btn').click({ force: true })
    cy.get('.transfer-balance-confirm-popup').first().within(() => {
      cy.get('.p-confirm-popup-accept').click({ force: true })
    })
    cy.wait(1000)

    cy.get('.p-panel-content').eq(3).contains('Cashback Balance Can Only Be Transferred Once')
  })

  it('After transferring Cashback Balance, Receiving Member Should Have the full balance, and transffering member should have 0. Customers Table should reflect this', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('tr').eq(1).contains('Gold')
    cy.get('tr').eq(1).contains('$0')

    cy.get('.p-row-toggler').first().click({force: true})


    cy.get('tr').eq(4).contains('Gold.Member.SubAccount@example.com')
    cy.get('tr').eq(4).contains('$0')


    cy.get('tr').eq(5).contains('Non')
    cy.get('tr').eq(5).contains('$2')



  })

  it('Should still show unable to transfer Balance on revisiting edit page', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('.customer-edit-btn').eq(0).click({force: true})

    cy.get('.p-panel-content').eq(3).contains('Cashback Balance Can Only Be Transferred Once')


  })
})
