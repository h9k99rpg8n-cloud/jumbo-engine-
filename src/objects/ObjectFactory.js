import * as THREE from 'three';
import { GameObject } from './GameObject.js';

export class ObjectFactory {
  constructor() {
    this.contador = 0;
  }

  crearCubo() {
    this.contador += 1;

    const size = 2;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.06,
      roughness: 0.46,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `Cubo ${this.contador}`;
    mesh.position.set(0, size / 2, 0);
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    return new GameObject({
      id: `jumbo-cube-${this.contador}`,
      nombre: mesh.name,
      tipo: 'cube',
      mesh,
    });
  }
}
