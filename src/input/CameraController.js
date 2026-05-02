import * as THREE from 'three';

export class CameraController {
  constructor({ camera, domElement, target, minDistance = 6, maxDistance = 85 }) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = target || new THREE.Vector3(0, 0, 0);
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;

    this.distance = 42;
    this.azimuth = Math.PI / 4;
    this.elevation = Math.PI / 4;

    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.lastTouchDistance = null;

    this.rotationSpeed = 0.006;
    this.zoomSpeed = 0.08;
    this.minElevation = 0.12;
    this.maxElevation = Math.PI / 2.15;
  }

  iniciar() {
    this.domElement.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    this.domElement.addEventListener('pointermove', (event) => this.onPointerMove(event));
    this.domElement.addEventListener('pointerup', () => this.onPointerUp());
    this.domElement.addEventListener('pointercancel', () => this.onPointerUp());
    this.domElement.addEventListener('wheel', (event) => this.onWheel(event), { passive: false });

    this.domElement.addEventListener('touchmove', (event) => this.onTouchMove(event), { passive: false });
    this.domElement.addEventListener('touchend', () => {
      this.lastTouchDistance = null;
    });

    this.actualizar();
  }

  onPointerDown(event) {
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.domElement.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;

    this.azimuth -= deltaX * this.rotationSpeed;
    this.elevation += deltaY * this.rotationSpeed;
    this.elevation = THREE.MathUtils.clamp(this.elevation, this.minElevation, this.maxElevation);

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onPointerUp() {
    this.isDragging = false;
  }

  onWheel(event) {
    event.preventDefault();
    this.zoom(event.deltaY * this.zoomSpeed);
  }

  onTouchMove(event) {
    if (event.touches.length !== 2) return;
    event.preventDefault();

    const [a, b] = event.touches;
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    const currentDistance = Math.hypot(dx, dy);

    if (this.lastTouchDistance !== null) {
      const delta = this.lastTouchDistance - currentDistance;
      this.zoom(delta * 0.08);
    }

    this.lastTouchDistance = currentDistance;
  }

  zoom(delta) {
    this.distance = THREE.MathUtils.clamp(
      this.distance + delta,
      this.minDistance,
      this.maxDistance,
    );
  }

  actualizar() {
    const x = this.target.x + this.distance * Math.sin(this.elevation) * Math.sin(this.azimuth);
    const y = this.target.y + this.distance * Math.cos(this.elevation);
    const z = this.target.z + this.distance * Math.sin(this.elevation) * Math.cos(this.azimuth);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
