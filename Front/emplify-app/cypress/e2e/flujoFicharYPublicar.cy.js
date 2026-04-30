describe('Flujo Diario Emplify: Fichar y Publicar', () => {

  beforeEach(() => {
    // 1. Visitamos la app
    cy.visit('http://localhost:8100');
  });

  it('Debe iniciar sesión, fichar entrada y crear una publicación', () => {

    // =======================================================
    // PASO 1: LOGIN
    // =======================================================
    cy.get('ion-input[name="usuario"]').type('martin@tech.com');
    cy.get('ion-input[name="password"]').type('1234');
    cy.get('ion-button[type="submit"]').click();

    // Verificamos que hemos entrado comprobando que existe la tarjeta de Fichaje
    cy.get('h3.shift-title').should('contain', 'Fichaje');


    // =======================================================
    // PASO 2: FICHAR ENTRADA
    // =======================================================
    // Hacemos clic en el botón de Registrar Entrada
    cy.get('ion-button.btn-entrada').click();
    cy.wait(5000);

    // Verificamos que ahora aparece el botón de salida
    cy.get('ion-button.btn-salida').should('be.visible')
      .and('contain', 'Registrar Salida');


    // =======================================================
    // PASO 3: IR A LA VOZ DEL EMPLEADO
    // =======================================================
    // Buscamos la tarjeta completa que contiene el título "Voz del Empleado" y hacemos clic
    cy.contains('.flat-card', 'Voz del Empleado').click();

    // Verificamos que hemos llegado a la página correcta
    cy.get('.section-header h2').should('contain', 'Voz del Empleado');


    // =======================================================
    // PASO 4: CREAR UNA PUBLICACIÓN
    // =======================================================
    // 4.1 Hacemos clic en el botón flotante
    cy.get('#open-modal').click();

    // Esperamos a que el modal sea visible
    cy.get('ion-modal').should('be.visible');

    // 4.2 Rellenamos el título usando el atributo 'label' que le pusiste en el HTML
    cy.get('ion-modal ion-input[label="Asunto o Título"]')
      .type('Mejora en la máquina de café');

    // 4.3 Rellenamos el contenido en el textarea
    cy.get('ion-modal ion-textarea[label="¿Qué quieres compartir?"]')
      .type('Hola equipo, creo que deberíamos probar un café de especialidad para los lunes. ¡Nos dará más energía!');

    // 4.4 Hacemos clic en el botón de publicar
    cy.get('ion-modal ion-button.form-submit-btn').click();

    // =======================================================
    // PASO 5: VERIFICACIÓN FINAL
    // =======================================================
    // Verificamos que el modal se ha cerrado
    cy.get('ion-modal').should('not.be.visible');

    // Verificamos que la nueva publicación aparece en la lista
    // Buscamos en el DOM el contenido exacto que acabamos de publicar
    cy.contains('.post-content h3', 'Mejora en la máquina de café').should('be.visible');
    cy.contains('.post-content p', 'Hola equipo, creo que deberíamos probar un café').should('be.visible');
  });

});
