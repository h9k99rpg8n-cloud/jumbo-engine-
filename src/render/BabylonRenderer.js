import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  GizmoManager,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

export class BabylonRenderer {
  constructor({ viewport }) {
    this.viewport = viewport;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'jumbo-canvas';
    this.viewport.appendChild(this.canvas);

    this.engine = new Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.01, 0.015, 0.03, 1);

    this.camera = new ArcRotateCamera(
      'JumboEditorCamera',
      Math.PI / 4,
      Math.PI / 3.2,
      70,
      new Vector3(0, 0, 0),
      this.scene,
    );

    this.camera.lowerRadiusLimit = 1.5;
    this.camera.upperRadiusLimit = 240;
    this.camera.wheelPrecision = 35;
    this.camera.pinchPrecision = 80;
    this.camera.angularSensibilityX = 900;
    this.camera.angularSensibilityY = 900;
    this.camera.attachControl(this.canvas, true);

    this.light = new HemisphericLight('Luz de vista interna', new Vector3(0, 1, 0), this.scene);
    this.light.intensity = 0.95;

    this.objects = [];
    this.selectedMesh = null;

    this.crearRejilla(200);
    this.crearGizmos();
    this.registrarSeleccion();
    this.registrarEventos();
  }

  crearRejilla(size) {
    const grid = MeshBuilder.CreateGround('Rejilla 200 x 200', {
      width: size,
      height: size,
      subdivisions: size,
    }, this.scene);

    const material = new StandardMaterial('Material rejilla oscura', this.scene);
    material.diffuseColor = new Color3(0.02, 0.03, 0.06);
    material.specularColor = new Color3(0, 0, 0);
    material.wireframe = true;
    material.emissiveColor = new Color3(0.05, 0.11, 0.24);

    grid.material = material;
    grid.isPickable = false;
    this.grid = grid;
  }

  crearGizmos() {
    this.gizmoManager = new GizmoManager(this.scene);
    this.gizmoManager.positionGizmoEnabled = false;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;
    this.gizmoManager.usePointerToAttachGizmos = false;
  }

  registrarSeleccion() {
    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== 1) return;
      if (this.currentTool !== 'select') return;

      const picked = pointerInfo.pickInfo?.pickedMesh;
      if (picked && picked.metadata?.isJumboObject) {
        this.seleccionar(picked);
      } else {
        this.seleccionar(null);
      }
    });
  }

  registrarEventos() {
    window.addEventListener('resize', () => this.resize());
  }

  setTool(tool) {
    this.currentTool = tool;

    this.gizmoManager.positionGizmoEnabled = tool === 'move';
    this.gizmoManager.rotationGizmoEnabled = tool === 'rotate';
    this.gizmoManager.scaleGizmoEnabled = tool === 'scale';

    if (this.selectedMesh && tool !== 'select') {
      this.gizmoManager.attachToMesh(this.selectedMesh);
    }

    if (tool === 'select' || !this.selectedMesh) {
      this.gizmoManager.attachToMesh(null);
    }
  }

  crearCubo() {
    const cube = MeshBuilder.CreateBox(`Cubo ${this.objects.length + 1}`, { size: 2 }, this.scene);
    cube.position.y = 1;
    cube.metadata = { isJumboObject: true, type: 'cube' };

    const material = new StandardMaterial('Material cubo blanco', this.scene);
    material.diffuseColor = new Color3(0.82, 0.82, 0.78);
    material.specularColor = new Color3(0.18, 0.18, 0.18);
    cube.material = material;

    this.objects.push(cube);
    this.seleccionar(cube);
    return cube;
  }

  seleccionar(mesh) {
    this.selectedMesh = mesh;

    if (!mesh || this.currentTool === 'select') {
      this.gizmoManager.attachToMesh(null);
      return;
    }

    this.gizmoManager.attachToMesh(mesh);
  }

  renderLoop() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  resize() {
    this.engine.resize();
  }
}
