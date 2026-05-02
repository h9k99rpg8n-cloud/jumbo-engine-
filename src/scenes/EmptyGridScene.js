import * as THREE from 'three';

export class EmptyGridScene {
  constructor({ gridSize = 200, gridDivisions = 200 } = {}) {
    this.gridSize = gridSize;
    this.gridDivisions = gridDivisions;
    this.scene = null;
    this.target = new THREE.Vector3(0, 0, 0);
    this.gameObjects = [];
  }

  crear() {
    this.scene = new THREE.Scene();
    this.scene.name = 'Escena vacía';
    this.scene.background = new THREE.Color('#05070d');

    const grid = new THREE.GridHelper(
      this.gridSize,
      this.gridDivisions,
      0x2f7dff,
      0x172033,
    );

    grid.name = 'Rejilla 200 x 200';
    grid.position.set(0, 0, 0);
    this.scene.add(grid);

    const axes = new THREE.AxesHelper(5);
    axes.name = 'Ejes de origen';
    this.scene.add(axes);

    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.65);
    luzAmbiente.name = 'Luz ambiente interna';
    this.scene.add(luzAmbiente);

    const luzVista = new THREE.DirectionalLight(0xffffff, 1.15);
    luzVista.name = 'Luz de vista interna';
    luzVista.position.set(8, 12, 8);
    this.scene.add(luzVista);

    return this.scene;
  }

  agregarGameObject(gameObject) {
    this.gameObjects.push(gameObject);
    this.scene.add(gameObject.mesh);
  }
}
