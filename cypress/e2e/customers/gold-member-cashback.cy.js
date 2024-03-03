describe('CashBack', () => {

  before(() => {
    cy.tests_cleanup();
  });

  beforeEach(() => {
    cy.session('signed-in', () => {
      cy.signIn();
    });
  });

  it('Should Be Able To Create A Transaction for Newly Created Member', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.createGoldOrSilverWithSubCustomer('Gold', 'Member', 'goldmember@example.com', 'Gold');

    cy.get('nav').within(() => {
      cy.get('a').eq(1).click({force: true })
    })
    cy.createTransaction('Gold', 'Gold M.', 'Ninnetta');
    cy.get('tr').eq(1).contains('Ninnetta Balding')
    cy.get('tr').eq(1).contains('Gold')

  });

  it("Transactions For Gold Member Should Add To 1% Cashback Balance, And Not Effect Sub Account Balance", () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.get('.p-row-toggler ').first().click({force: true})

    cy.get('tr').eq(1).contains('$2')
    cy.get('tr').eq(2).contains('$0')

  })

  it('Should Be Able To Create A Transaction for Newly Created Gold Member Sub-Account', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });

    cy.get('nav').within(() => {
      cy.get('a').eq(1).click({force: true })
    })
    cy.createTransaction('SubAccount', 'SubAccount', 'Ninnetta');
    cy.get('tr').eq(1).contains('Ninnetta Balding')
    cy.get('tr').eq(1).contains('Gold-SubAccount')

  });

  it("Transactions For Gold Member Sub-Account Should Add To 1% Cashback Balance, And Not Effect Main Account Balance", () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.get('.p-row-toggler').first().click({force: true})

    cy.get('tr').eq(1).contains('$2')
    cy.get('tr').eq(2).contains('$2')

  })

  it("Transactions Balance Should Add Correctly When Creating More Transactions", () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });

    cy.get('nav').within(() => {
      cy.get('a').eq(1).click({force: true })
    })
    cy.createTransaction('Gold', 'Gold M.', 'Ninnetta');
    cy.wait(2000)
    cy.createTransaction('SubAccount', 'SubAccount', 'Ninnetta');

    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.get('.p-row-toggler').first().click({force: true})

    cy.get('tr').eq(1).contains('$4')
    cy.get('tr').eq(2).contains('$4')

  })

});
