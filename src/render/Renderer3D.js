import * as THREE from 'three';

export class Renderer3D {
  constructor({ viewport }) {
    this.viewport = viewport;
    this.scene = null;

    this.camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    this.camera.position.set(30, 26, 30);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });

    this.renderer.setClearColor('#05070d');
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.domElement = this.renderer.domElement;
    this.domElement.className = 'jumbo-canvas';
    this.viewport.appendChild(this.domElement);

    this.redimensionar();
  }

  usarEscena(scene) {
    this.scene = scene;
  }

  redimensionar() {
    const ancho = Math.max(1, this.viewport.clientWidth);
    const alto = Math.max(1, this.viewport.clientHeight);

    this.camera.aspect = ancho / alto;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(ancho, alto, false);
  }

  renderizar() {
    if (!this.scene) return;
    this.renderer.render(this.scene, this.camera);
  }
}
