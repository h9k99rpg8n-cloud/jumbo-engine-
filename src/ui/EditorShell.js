export class EditorShell {
  constructor({ contenedor }) {
    this.contenedor = contenedor;
  }

  crear() {
    this.contenedor.innerHTML = `
      <main class="jumbo-root">
        <section class="jumbo-viewport" id="viewport3D" aria-label="Escena de Jumbo Engine"></section>

        <section class="create-dock" aria-label="Crear objeto">
          <button class="create-button" id="createButton" aria-label="Abrir menu de creacion">
            <span class="plus-icon" aria-hidden="true"></span>
          </button>

          <div class="create-menu" id="createMenu" aria-hidden="true">
            <button class="create-menu-item" id="createCubeButton">Cubo</button>
          </div>
        </section>
      </main>
    `;
  }

  obtenerViewport() {
    return this.contenedor.querySelector('#viewport3D');
  }

  onCrearCubo(callback) {
    const createButton = this.contenedor.querySelector('#createButton');
    const createMenu = this.contenedor.querySelector('#createMenu');
    const createCubeButton = this.contenedor.querySelector('#createCubeButton');

    createButton.addEventListener('click', () => {
      const abierto = createMenu.classList.toggle('is-open');
      createMenu.setAttribute('aria-hidden', String(!abierto));
    });

    createCubeButton.addEventListener('click', () => {
      createMenu.classList.remove('is-open');
      createMenu.setAttribute('aria-hidden', 'true');
      callback();
    });
  }
}
