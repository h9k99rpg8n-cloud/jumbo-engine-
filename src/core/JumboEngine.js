import { BabylonRenderer } from '../render/BabylonRenderer.js';
import { EditorShell } from '../ui/EditorShell.js';

export class JumboEngine {
  constructor({ contenedor, nombre, version }) {
    this.contenedor = contenedor;
    this.nombre = nombre;
    this.version = version;

    this.ui = null;
    this.renderer = null;
  }

  iniciar() {
    this.ui = new EditorShell({
      contenedor: this.contenedor,
      nombre: this.nombre,
      version: this.version,
    });

    this.ui.crear();

    this.renderer = new BabylonRenderer({
      viewport: this.ui.obtenerViewport(),
    });

    this.renderer.setTool('select');
    this.ui.onCrearCubo(() => this.renderer.crearCubo());
    this.ui.onCambiarHerramienta((tool) => this.renderer.setTool(tool));
    this.renderer.renderLoop();
  }
}
