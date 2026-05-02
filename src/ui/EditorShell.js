export class EditorShell {
  constructor({ contenedor }) {
    this.contenedor = contenedor;
  }

  crear() {
    this.contenedor.innerHTML = `
      <main class="jumbo-root">
        <section class="jumbo-viewport" id="viewport3D" aria-label="Escena vacía de Jumbo Engine"></section>
      </main>
    `;
  }

  obtenerViewport() {
    return this.contenedor.querySelector('#viewport3D');
  }
}
