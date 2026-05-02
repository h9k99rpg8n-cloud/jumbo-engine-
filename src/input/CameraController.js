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
    this.desiredDistance = this.distance;

    this.azimuth = Math.PI / 4;
    this.elevation = Math.PI / 3.2;
    this.desiredAzimuth = this.azimuth;
    this.desiredElevation = this.elevation;

    this.desiredTarget = this.target.clone();

    this.activePointers = new Map();
    this.lastX = 0;
    this.lastY = 0;
    this.lastTapTime = 0;
    this.lastTapX = 0;
    this.lastTapY = 0;
    this.lastPinchDistance = null;
    this.lastPinchCenter = null;

    this.rotationSpeed = 0.005;
    this.panSpeed = 0.0018;
    this.wheelZoomSpeed = 0.035;
    this.pinchZoomSpeed = 0.12;
    this.smoothness = 0.16;

    this.minElevation = 0.08;
    this.maxElevation = Math.PI / 2.04;
    this.maxTargetRadius = 80;
  }

  iniciar() {
    this.domElement.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    this.domElement.addEventListener('pointermove', (event) => this.onPointerMove(event));
    this.domElement.addEventListener('pointerup', (event) => this.onPointerUp(event));
    this.domElement.addEventListener('pointercancel', (event) => this.onPointerUp(event));
    this.domElement.addEventListener('wheel', (event) => this.onWheel(event), { passive: false });
    this.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

    this.actualizar(true);
  }

  onPointerDown(event) {
    event.preventDefault();
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.domElement.setPointerCapture?.(event.pointerId);

    if (this.activePointers.size === 1) {
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.detectarDobleToque(event.clientX, event.clientY);
    }

    if (this.activePointers.size === 2) {
      this.lastPinchDistance = this.obtenerDistanciaPinch();
      this.lastPinchCenter = this.obtenerCentroPinch();
    }
  }

  onPointerMove(event) {
    if (!this.activePointers.has(event.pointerId)) return;

    event.preventDefault();
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size === 2) {
      this.actualizarPinchYPan();
      return;
    }

    if (this.activePointers.size !== 1) return;

    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;

    this.desiredAzimuth -= deltaX * this.rotationSpeed;
    this.desiredElevation += deltaY * this.rotationSpeed;
    this.desiredElevation = THREE.MathUtils.clamp(
      this.desiredElevation,
      this.minElevation,
      this.maxElevation,
    );

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onPointerUp(event) {
    this.activePointers.delete(event.pointerId);
    this.lastPinchDistance = null;
    this.lastPinchCenter = null;

    if (this.activePointers.size === 1) {
      const pointer = [...this.activePointers.values()][0];
      this.lastX = pointer.x;
      this.lastY = pointer.y;
    }
  }

  onWheel(event) {
    event.preventDefault();
    this.zoom(event.deltaY * this.wheelZoomSpeed);
  }

  actualizarPinchYPan() {
    const currentDistance = this.obtenerDistanciaPinch();
    const currentCenter = this.obtenerCentroPinch();

    if (this.lastPinchDistance !== null && currentDistance !== null) {
      const zoomDelta = (this.lastPinchDistance - currentDistance) * this.pinchZoomSpeed;
      this.zoom(zoomDelta);
    }

    if (this.lastPinchCenter && currentCenter) {
      const deltaX = currentCenter.x - this.lastPinchCenter.x;
      const deltaY = currentCenter.y - this.lastPinchCenter.y;
      this.pan(deltaX, deltaY);
    }

    this.lastPinchDistance = currentDistance;
    this.lastPinchCenter = currentCenter;
  }

  obtenerDistanciaPinch() {
    const pointers = [...this.activePointers.values()];
    if (pointers.length < 2) return null;

    const dx = pointers[0].x - pointers[1].x;
    const dy = pointers[0].y - pointers[1].y;
    return Math.hypot(dx, dy);
  }

  obtenerCentroPinch() {
    const pointers = [...this.activePointers.values()];
    if (pointers.length < 2) return null;

    return {
      x: (pointers[0].x + pointers[1].x) / 2,
      y: (pointers[0].y + pointers[1].y) / 2,
    };
  }

  zoom(delta) {
    this.desiredDistance = THREE.MathUtils.clamp(
      this.desiredDistance + delta,
      this.minDistance,
      this.maxDistance,
    );
  }

  pan(deltaX, deltaY) {
    const offset = new THREE.Vector3();
    offset.copy(this.camera.position).sub(this.target);

    const right = new THREE.Vector3();
    right.crossVectors(this.camera.up, offset).normalize();

    const up = new THREE.Vector3();
    up.crossVectors(offset, right).normalize();

    const panScale = this.desiredDistance * this.panSpeed;
    const movement = new THREE.Vector3()
      .addScaledVector(right, deltaX * panScale)
      .addScaledVector(up, deltaY * panScale);

    this.desiredTarget.add(movement);
    this.limitarTarget();
  }

  detectarDobleToque(x, y) {
    const now = performance.now();
    const deltaTime = now - this.lastTapTime;
    const deltaPosition = Math.hypot(x - this.lastTapX, y - this.lastTapY);

    if (deltaTime < 280 && deltaPosition < 32) {
      this.centrarEnOrigen();
      this.lastTapTime = 0;
      return;
    }

    this.lastTapTime = now;
    this.lastTapX = x;
    this.lastTapY = y;
  }

  centrarEnOrigen() {
    this.desiredTarget.set(0, 0, 0);
    this.desiredDistance = 55;
    this.desiredAzimuth = Math.PI / 4;
    this.desiredElevation = Math.PI / 3.2;
  }

  limitarTarget() {
    const horizontalDistance = Math.hypot(this.desiredTarget.x, this.desiredTarget.z);
    if (horizontalDistance <= this.maxTargetRadius) return;

    const scale = this.maxTargetRadius / horizontalDistance;
    this.desiredTarget.x *= scale;
    this.desiredTarget.z *= scale;
  }

  actualizar(inmediato = false) {
    const factor = inmediato ? 1 : this.smoothness;

    this.distance = THREE.MathUtils.lerp(this.distance, this.desiredDistance, factor);
    this.azimuth = THREE.MathUtils.lerp(this.azimuth, this.desiredAzimuth, factor);
    this.elevation = THREE.MathUtils.lerp(this.elevation, this.desiredElevation, factor);
    this.target.lerp(this.desiredTarget, factor);

    const x = this.target.x + this.distance * Math.sin(this.elevation) * Math.sin(this.azimuth);
    const y = this.target.y + this.distance * Math.cos(this.elevation);
    const z = this.target.z + this.distance * Math.sin(this.elevation) * Math.cos(this.azimuth);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
