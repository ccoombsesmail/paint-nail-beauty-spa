describe('Non Gold Member CashBack Spec', () => {

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

  it("Transactions For Silver/Bronze/Non Member Should NOT add To 1% Cashback Balance, And Not Effect Sub Account Balance", () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.get('.p-row-toggler').first().click({force: true})

    cy.get('tr').eq(1).contains('$0')
    cy.get('tr').eq(4).contains('$0')

    cy.get('tr').eq(5).contains('$0')
    cy.get('tr').eq(6).contains('$0')

  })

  it('Should Be Able To Create A Transaction for Newly Created Silver Member Sub-Account', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });

    cy.get('nav').within(() => {
      cy.get('a').eq(1).click({force: true })
    })
    cy.createTransaction('SubAccount', 'SubAccount', 'Ninnetta');
    cy.get('tr').eq(1).contains('Ninnetta Balding')
    cy.get('tr').eq(1).contains('Silver-SubAccount')

  });

  it("Transactions For Silver Member Sub-Account Should NOT add To 1% Cashback Balance, And Not Effect Main Account Balance", () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.get('.p-row-toggler').first().click({force: true})

    cy.get('tr').eq(1).contains('$0')
    cy.get('tr').eq(4).contains('$0')

  })


});
