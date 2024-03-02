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
  // it('Should Be Able to Create A Bronze Customer With a Service Type', () => {
  //
  //   cy.visit('http://localhost:3000', {
  //     failOnStatusCode: false
  //   })
  //   // Mount the React component for the Home pag
  //   cy.get('#cy-create-customer-btn').click();
  //
  //     // Fill in the text inputs
  //     cy.get('[name="firstName"]').type('John');
  //     cy.get('[name="lastName"]').type('Doe');
  //     cy.get('[name="email"]').type('john.doe@example.com');
  //     cy.get('[name="phoneNumber"]').type('1234567890');
  //
  //     // Selecting from a dropdown might require you to first open the dropdown and then select an item
  //     // This is an example and might need to be adjusted based on how your dropdown is implemented
  //
  //
  //     cy.get('.p-dialog').within(() => {
  //       cy.get('.p-dropdown-trigger').first().click({ force: true });
  //     })
  //     cy.get('.p-dropdown-items .p-dropdown-item').contains('United States').click({ force: true }); // Select a country code
  //
  //
  //     cy.get('.p-dialog').within(() => {
  //       cy.get('.p-dropdown-trigger').eq(1).click({ force: true });
  //     })
  //     cy.get('.p-dropdown-items .p-dropdown-item').contains('Bronze').click({ force: true }); // Select a membership level
  //
  //
  //     cy.get('.p-dialog').within(() => {
  //       cy.get('.p-dropdown-trigger').eq(2).click({ force: true });
  //     })
  //     cy.get('.p-dropdown-items .p-dropdown-item').contains('Nail').click({ force: true }); // Adjust the selector as needed
  //
  //     cy.get('form').submit(); // Or cy.get('button').contains('Submit').click();
  //
  //
  //   })
  //
  //
  // it('Should Be Able to Create A Silver Customer Without A Sub Account', () => {
  //
  //   cy.visit('http://localhost:3000', {
  //     failOnStatusCode: false
  //   })
  //   // Mount the React component for the Home pag
  //   cy.get('#cy-create-customer-btn').click();
  //
  //   // Fill in the text inputs
  //   cy.get('[name="firstName"]').type('John');
  //   cy.get('[name="lastName"]').type('Doe');
  //   cy.get('[name="email"]').type('john.doe@example.com');
  //   cy.get('[name="phoneNumber"]').type('1234567890');
  //
  //   // Selecting from a dropdown might require you to first open the dropdown and then select an item
  //   // This is an example and might need to be adjusted based on how your dropdown is implemented
  //
  //
  //   cy.get('.p-dialog').within(() => {
  //     cy.get('.p-dropdown-trigger').first().click({ force: true });
  //   })
  //   cy.get('.p-dropdown-items .p-dropdown-item').contains('United States').click({ force: true }); // Select a country code
  //
  //
  //   cy.get('.p-dialog').within(() => {
  //     cy.get('.p-dropdown-trigger').eq(1).click({ force: true });
  //   })
  //   cy.get('.p-dropdown-items .p-dropdown-item').contains('Silver').click({ force: true }); // Select a membership level
  //
  //   cy.get('form').submit(); // Or cy.get('button').contains('Submit').click();
  //
  //
  // })
  //
  //
  // it('Should Be Able to Create A Gold Customer Without A Sub Account', () => {
  //
  //   cy.visit('http://localhost:3000', {
  //     failOnStatusCode: false
  //   })
  //   // Mount the React component for the Home pag
  //   cy.get('#cy-create-customer-btn').click();
  //
  //   // Fill in the text inputs
  //   cy.get('[name="firstName"]').type('John');
  //   cy.get('[name="lastName"]').type('Doe');
  //   cy.get('[name="email"]').type('john.doe@example.com');
  //   cy.get('[name="phoneNumber"]').type('1234567890');
  //
  //   // Selecting from a dropdown might require you to first open the dropdown and then select an item
  //   // This is an example and might need to be adjusted based on how your dropdown is implemented
  //
  //
  //   cy.get('.p-dialog').within(() => {
  //     cy.get('.p-dropdown-trigger').first().click({ force: true });
  //   })
  //   cy.get('.p-dropdown-items .p-dropdown-item').contains('United States').click({ force: true }); // Select a country code
  //
  //
  //   cy.get('.p-dialog').within(() => {
  //     cy.get('.p-dropdown-trigger').eq(1).click({ force: true });
  //   })
  //   cy.get('.p-dropdown-items .p-dropdown-item').contains('Gold').click({ force: true }); // Select a membership level
  //
  //   cy.get('form').submit(); // Or cy.get('button').contains('Submit').click();
  //
  //
  // })



  it('Should create be able to transfer a Silver Membership With Sub account to a NonMember', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })

    cy.createNonMemberCustomer('Non', 'Member', 'nonmember@example.com', 'Non Member');
    cy.createGoldOrSilverWithSubCustomer('Silver', 'Member', 'silvermember@example.com', 'Silver')

    cy.wait(1000)
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

  it('After transferring Silver Membership with Sub Account to Non Member, New Member Should Have Silver Membership with Sub Account. Customers Table should reflect this', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('tr').eq(1).contains('Non Member')
    cy.get('tr').eq(2).contains('Silver')
    cy.get('.p-row-toggler ').first().click({force: true})
    cy.get('tr').eq(5).contains('Silver.Member.SubAccount@example.com')


  })


  it('Member who receives membership transfer should not be able to add a sub account, and existing sub account should be transferred under new member', () => {
    cy.visit('http://localhost:3000', {
      failOnStatusCode: false
    })
    cy.get('.customer-edit-btn').eq(1).click({force: true})

    cy.get('.p-panel-content').eq(0).within(() => {
      cy.get('[name="email"]').should('have.value', 'Silver.Member.SubAccount@example.com')
      cy.get('button').should('not.exist')
    })

  })

})
