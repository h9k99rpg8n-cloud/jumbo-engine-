import * as THREE from 'three';
import { GameObject } from './GameObject.js';

export class ObjectFactory {
  constructor() {
    this.contador = 0;
  }

  crearCubo() {
    this.contador += 1;

    const geometry = new THREE.BoxGeometry(4, 4, 4);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.08,
      roughness: 0.42,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `Cubo ${this.contador}`;
    mesh.position.set(0, 2, 0);
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
