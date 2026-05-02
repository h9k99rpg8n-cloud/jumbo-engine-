export class EditorShell {
  constructor({ contenedor }) {
    this.contenedor = contenedor;
  }

  crear() {
    this.contenedor.innerHTML = `
      <main class="jumbo-root">
        <section class="jumbo-viewport" id="viewport3D" aria-label="Escena de Jumbo Engine"></section>

        <section class="left-tools" aria-label="Herramientas de Jumbo Engine">
          <div class="create-dock" aria-label="Crear objeto">
            <button class="create-button" id="createButton" aria-label="Abrir menu de creacion">
              <span class="plus-icon" aria-hidden="true"></span>
            </button>

            <div class="create-menu" id="createMenu" aria-hidden="true">
              <button class="create-menu-item" id="createCubeButton">Cubo</button>
            </div>
          </div>

          <button class="tool-button select-tool is-active" data-tool="select" aria-label="Herramienta seleccion">
            <span class="select-icon" aria-hidden="true">
              <i class="finger-tip"></i>
              <i class="finger-body"></i>
              <i class="finger-hand"></i>
            </span>
          </button>

          <button class="tool-button move-tool" data-tool="move" aria-label="Herramienta mover">
            <span class="move-icon" aria-hidden="true">
              <i class="arrow arrow-up"></i>
              <i class="arrow arrow-right"></i>
              <i class="arrow arrow-down"></i>
              <i class="arrow arrow-left"></i>
              <i class="move-center"></i>
            </span>
          </button>

          <button class="tool-button rotate-tool" data-tool="rotate" aria-label="Herramienta rotar">
            <span class="rotate-icon" aria-hidden="true">
              <i class="rotate-ring"></i>
              <i class="rotate-head"></i>
            </span>
          </button>

          <button class="tool-button scale-tool" data-tool="scale" aria-label="Herramienta escalar">
            <span class="scale-icon" aria-hidden="true">
              <i class="scale-box"></i>
              <i class="scale-arrow scale-arrow-a"></i>
              <i class="scale-arrow scale-arrow-b"></i>
            </span>
          </button>
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

  onCambiarHerramienta(callback) {
    const buttons = [...this.contenedor.querySelectorAll('[data-tool]')];

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const tool = button.dataset.tool;

        buttons.forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');

        callback(tool);
      });
    });
  }
}
