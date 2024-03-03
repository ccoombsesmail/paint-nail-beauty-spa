describe('Non Gold Member CashBack Transfer Spec', () => {

  before(() => {
    cy.tests_cleanup();
  });

  beforeEach(() => {
    cy.session('signed-in', () => {
      cy.signIn();
    });
  });

  it('Should Be Able To Create A Transaction for Bronze, Silver, and NonMember', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.createNonMemberCustomer('Non', 'Member', 'nonmember@example.com')
    cy.createBronzeMember('Bronze', 'Member', 'bronzemember@example.com', 'Nail');
    cy.createGoldOrSilverWithSubCustomer('Silver', 'Member', 'silvermember@example.com', 'Silver');

    cy.get('nav').within(() => {
      cy.get('a').eq(1).click({force: true })
    })
    cy.createTransaction('Non', 'Non', 'Ninnetta');
    cy.wait(1000)
    cy.createTransaction('Bronze','Bronze M.', 'Ninnetta');
    cy.wait(1000)
    cy.createTransaction('Silver', 'Silver M.', 'Ninnetta');

    cy.get('tr').eq(1).contains('Ninnetta Balding')
    cy.get('tr').eq(1).contains('Silver')

    cy.get('tr').eq(2).contains('Ninnetta Balding')
    cy.get('tr').eq(2).contains('Bronze')

    cy.get('tr').eq(3).contains('Ninnetta Balding')
    cy.get('tr').eq(3).contains('Non')

  });

  it("Silver/Bronze/Non Member Should NOT be able to transfer cashback balance", () => {

    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('.p-row-toggler').first().click({force: true})
    cy.get('.customer-edit-btn').eq(0).click({force: true})
    cy.get('.p-panel-content').eq(3).contains('Only Activated Gold Members Can Transfer Their Cashback Balance')


    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('.p-row-toggler').first().click({force: true})
    cy.get('.customer-edit-btn').eq(1).click({force: true})
    cy.get('.p-panel-content').eq(3).contains('Only Activated Gold Members Can Transfer Their Cashback Balance')


    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('.p-row-toggler').first().click({force: true})
    cy.get('.customer-edit-btn').eq(2).click({force: true})
    cy.get('.p-panel-content').eq(3).contains('Only Activated Gold Members Can Transfer Their Cashback Balance')


    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('.p-row-toggler').first().click({force: true})
    cy.get('.customer-edit-btn').eq(3).click({force: true})
    cy.get('.p-panel-content').eq(3).contains('Only Activated Gold Members Can Transfer Their Cashback Balance')


  })



});
