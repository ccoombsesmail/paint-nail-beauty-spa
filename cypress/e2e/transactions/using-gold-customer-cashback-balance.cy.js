describe('Using Gold Member Cashback Balance', () => {

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

  it("Should Be Able To Use Partial Cashback Balance", () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });

    cy.get('nav').within(() => {
      cy.get('a').eq(1).click({force: true })
    })
    cy.createTransaction('Gold', 'Gold M.', 'Ninnetta', '1');
    cy.wait(2000)

    cy.checkCashbackBalanceToUse('Gold', 'Gold M.', '3')



    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.get('.p-row-toggler').first().click({force: true})

    cy.get('tr').eq(1).contains('$3')
    cy.get('tr').eq(2).contains('$2')

  })

  it("Should Be Able To Use Cashback Balance of Sub Account", () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });

    cy.get('nav').within(() => {
      cy.get('a').eq(1).click({force: true })
    })
    cy.createTransaction('SubAccount', 'SubAccount', 'Ninnetta', '2');

    cy.wait(2000)

    cy.checkCashbackBalanceToUse('SubAccount', 'SubAccount', '2')



    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    });
    cy.get('.p-row-toggler').first().click({force: true})

    cy.get('tr').eq(1).contains('$3')
    cy.get('tr').eq(2).contains('$2')

  })

});
