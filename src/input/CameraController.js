import * as THREE from 'three';

export class CameraController {
  constructor({
    camera,
    domElement,
    target,
    minDistance = 1.5,
    maxDistance = 180,
    initialDistance = 55,
  }) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = target || new THREE.Vector3(0, 0, 0);
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;

    this.distance = THREE.MathUtils.clamp(initialDistance, this.minDistance, this.maxDistance);
    this.azimuth = Math.PI / 4;
    this.elevation = Math.PI / 3.2;

    this.isDragging = false;
    this.activePointers = new Map();
    this.lastX = 0;
    this.lastY = 0;
    this.lastPinchDistance = null;

    this.rotationSpeed = 0.0052;
    this.wheelZoomSpeed = 0.035;
    this.pinchZoomSpeed = 0.12;
    this.minElevation = 0.08;
    this.maxElevation = Math.PI / 2.05;
  }

  iniciar() {
    this.domElement.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    this.domElement.addEventListener('pointermove', (event) => this.onPointerMove(event));
    this.domElement.addEventListener('pointerup', (event) => this.onPointerUp(event));
    this.domElement.addEventListener('pointercancel', (event) => this.onPointerUp(event));
    this.domElement.addEventListener('wheel', (event) => this.onWheel(event), { passive: false });

    this.actualizar();
  }

  onPointerDown(event) {
    event.preventDefault();
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.domElement.setPointerCapture?.(event.pointerId);

    if (this.activePointers.size === 1) {
      this.isDragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    }

    if (this.activePointers.size === 2) {
      this.isDragging = false;
      this.lastPinchDistance = this.obtenerDistanciaPinch();
    }
  }

  onPointerMove(event) {
    if (!this.activePointers.has(event.pointerId)) return;

    event.preventDefault();
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size === 2) {
      const currentPinchDistance = this.obtenerDistanciaPinch();
      if (this.lastPinchDistance !== null) {
        const delta = this.lastPinchDistance - currentPinchDistance;
        this.zoom(delta * this.pinchZoomSpeed);
      }
      this.lastPinchDistance = currentPinchDistance;
      return;
    }

    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;

    this.azimuth -= deltaX * this.rotationSpeed;
    this.elevation += deltaY * this.rotationSpeed;
    this.elevation = THREE.MathUtils.clamp(this.elevation, this.minElevation, this.maxElevation);

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onPointerUp(event) {
    this.activePointers.delete(event.pointerId);
    this.lastPinchDistance = null;
    this.isDragging = this.activePointers.size === 1;

    if (this.isDragging) {
      const pointer = [...this.activePointers.values()][0];
      this.lastX = pointer.x;
      this.lastY = pointer.y;
    }
  }

  onWheel(event) {
    event.preventDefault();
    this.zoom(event.deltaY * this.wheelZoomSpeed);
  }

  obtenerDistanciaPinch() {
    const pointers = [...this.activePointers.values()];
    if (pointers.length < 2) return null;

    const dx = pointers[0].x - pointers[1].x;
    const dy = pointers[0].y - pointers[1].y;
    return Math.hypot(dx, dy);
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
