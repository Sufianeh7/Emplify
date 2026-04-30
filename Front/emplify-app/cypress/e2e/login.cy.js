describe('Login Emplify App', () => {

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.visit('http://localhost:8100');
  });

  it('1. Debe cargar el formulario de login correctamente', () => {
    cy.contains('h1.logo', 'emplify.').should('be.visible');
    cy.contains('h2.form-title', 'Iniciar sesión').should('be.visible');

    cy.get('ion-input[name="usuario"]').should('exist');
    cy.get('ion-input[name="password"]').should('exist');
    cy.get('ion-button[type="submit"]').should('exist');
  });

  it('2. Debe alternar la visibilidad de la contraseña con el icono del ojo', () => {
    cy.get('ion-input[name="password"]').type('secreto123');

    cy.get('ion-input[name="password"]').should('have.prop', 'type', 'password');

    cy.get('ion-icon.eye-icon').click();

    cy.get('ion-input[name="password"]').should('have.prop', 'type', 'text');
  });

  it('3. Debe permitir escribir las credenciales e iniciar sesión', () => {
    cy.get('ion-input[name="usuario"]').type('martin@tech.com');
    cy.get('ion-input[name="password"]').type('1234');

    cy.get('ion-button[type="submit"]').click();
  });

});
