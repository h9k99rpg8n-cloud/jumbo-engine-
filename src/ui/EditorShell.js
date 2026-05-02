export class EditorShell {
  constructor({ contenedor, nombre, version }) {
    this.contenedor = contenedor;
    this.nombre = nombre;
    this.version = version;
  }

  crear() {
    this.contenedor.innerHTML = `
      <main class="jumbo-shell">
        <header class="jumbo-header">
          <section>
            <h1>${this.nombre}</h1>
            <p>${this.version} · Escena vacía · Rejilla 100 × 100</p>
          </section>
          <span class="jumbo-badge">Web Engine</span>
        </header>

        <section class="jumbo-layout clean-mode">
          <aside class="jumbo-panel jumbo-hierarchy">
            <h2>Jerarquía</h2>
            <button class="item active">🌍 Escena vacía</button>
            <button class="item"># Rejilla 100 × 100</button>
            <button class="item muted">📷 Vista del editor</button>
          </aside>

          <section class="jumbo-viewport" id="viewport3D" aria-label="Viewport 3D de Jumbo Engine"></section>

          <aside class="jumbo-panel jumbo-inspector">
            <h2>Inspector</h2>
            <p class="label">Escena</p>
            <strong>Vacía</strong>
            <p class="label">Rejilla</p>
            <span>100 × 100 unidades</span>
            <p class="label">Cámara</p>
            <span>Orbital con zoom limitado</span>
            <p class="label">Contenido</p>
            <span class="status">Sin objetos, sin luces, sin cámara de juego</span>
          </aside>
        </section>

        <footer class="jumbo-toolbar">
          <button>Orbitar: 1 dedo / mouse</button>
          <button>Zoom: pellizcar / rueda</button>
          <button>Límite cerca: 6</button>
          <button>Límite lejos: 85</button>
        </footer>
      </main>
    `;
  }

  obtenerViewport() {
    return this.contenedor.querySelector('#viewport3D');
  }
}
