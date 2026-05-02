import { Renderer3D } from '../render/Renderer3D.js';
import { EmptyGridScene } from '../scenes/EmptyGridScene.js';
import { CameraController } from '../input/CameraController.js';
import { EditorShell } from '../ui/EditorShell.js';
import { ObjectFactory } from '../objects/ObjectFactory.js';
import { TransformGizmo } from '../gizmos/TransformGizmo.js';

export class JumboEngine {
  constructor({ contenedor, nombre, version }) {
    this.contenedor = contenedor;
    this.nombre = nombre;
    this.version = version;

    this.ui = null;
    this.renderer3D = null;
    this.sceneModule = null;
    this.cameraController = null;
    this.transformGizmo = null;
    this.objectFactory = new ObjectFactory();
    this.animationId = null;
  }

  iniciar() {
    this.ui = new EditorShell({
      contenedor: this.contenedor,
      nombre: this.nombre,
      version: this.version,
    });

    this.ui.crear();

    this.renderer3D = new Renderer3D({
      viewport: this.ui.obtenerViewport(),
    });

    this.sceneModule = new EmptyGridScene({
      gridSize: 200,
      gridDivisions: 200,
    });

    this.sceneModule.crear();
    this.renderer3D.usarEscena(this.sceneModule.scene);

    this.cameraController = new CameraController({
      camera: this.renderer3D.camera,
      domElement: this.renderer3D.domElement,
      target: this.sceneModule.target,
      minDistance: 1.5,
      maxDistance: 240,
      initialDistance: 70,
    });

    this.transformGizmo = new TransformGizmo({
      camera: this.renderer3D.camera,
      domElement: this.renderer3D.domElement,
      sceneModule: this.sceneModule,
      cameraController: this.cameraController,
    });

    this.cameraController.iniciar();
    this.transformGizmo.iniciar();
    this.ui.onCrearCubo(() => this.crearCubo());
    this.ui.onCambiarHerramienta((tool) => this.transformGizmo.setMode(tool));
    this.registrarEventos();
    this.loop();
  }

  crearCubo() {
    const cubo = this.objectFactory.crearCubo();
    this.sceneModule.agregarGameObject(cubo);
  }

  registrarEventos() {
    window.addEventListener('resize', () => {
      this.renderer3D.redimensionar();
    });
  }

  loop() {
    this.animationId = requestAnimationFrame(() => this.loop());

    this.cameraController.actualizar();
    this.renderer3D.renderizar();
  }
}
