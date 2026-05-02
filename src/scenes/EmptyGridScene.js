import * as THREE from 'three';

export class EmptyGridScene {
  constructor({ gridSize = 100, gridDivisions = 100 } = {}) {
    this.gridSize = gridSize;
    this.gridDivisions = gridDivisions;
    this.scene = null;
    this.target = new THREE.Vector3(0, 0, 0);
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

    grid.name = 'Rejilla 100 x 100';
    grid.position.set(0, 0, 0);
    this.scene.add(grid);

    const axes = new THREE.AxesHelper(5);
    axes.name = 'Ejes de origen';
    this.scene.add(axes);

    return this.scene;
  }
}
