import * as THREE from 'three';

export class MoveGizmo {
  constructor({ camera, domElement, sceneModule, cameraController }) {
    this.camera = camera;
    this.domElement = domElement;
    this.sceneModule = sceneModule;
    this.cameraController = cameraController;

    this.enabled = false;
    this.selectedObject = null;
    this.isDragging = false;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.hitPoint = new THREE.Vector3();
    this.dragOffset = new THREE.Vector3();
  }

  iniciar() {
    this.domElement.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    this.domElement.addEventListener('pointermove', (event) => this.onPointerMove(event));
    this.domElement.addEventListener('pointerup', (event) => this.onPointerUp(event));
    this.domElement.addEventListener('pointercancel', (event) => this.onPointerUp(event));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.isDragging = false;
      this.selectedObject = null;
      this.cameraController.setBloqueado(false);
      this.actualizarCursor();
    }
  }

  onPointerDown(event) {
    if (!this.enabled) return;
    if (event.pointerType === 'touch' && event.isPrimary === false) return;

    this.actualizarPointer(event);
    const seleccionado = this.buscarObjeto();

    if (!seleccionado) return;

    event.preventDefault();
    event.stopPropagation();

    this.selectedObject = seleccionado;
    this.isDragging = true;
    this.cameraController.setBloqueado(true);
    this.domElement.setPointerCapture?.(event.pointerId);

    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.hitPoint)) {
      this.dragOffset.copy(this.selectedObject.mesh.position).sub(this.hitPoint);
    }

    this.actualizarCursor();
  }

  onPointerMove(event) {
    if (!this.enabled || !this.isDragging || !this.selectedObject) return;

    event.preventDefault();
    event.stopPropagation();

    this.actualizarPointer(event);

    if (!this.raycaster.ray.intersectPlane(this.dragPlane, this.hitPoint)) return;

    const nextPosition = this.hitPoint.clone().add(this.dragOffset);
    nextPosition.y = this.selectedObject.mesh.position.y;

    this.selectedObject.mesh.position.copy(nextPosition);
  }

  onPointerUp(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;
    this.cameraController.setBloqueado(false);
    this.actualizarCursor();
  }

  actualizarPointer(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  buscarObjeto() {
    const meshes = this.sceneModule.gameObjects.map((gameObject) => gameObject.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length === 0) return null;

    return this.sceneModule.gameObjects.find((gameObject) => gameObject.mesh === hits[0].object) || null;
  }

  actualizarCursor() {
    if (!this.enabled) {
      this.domElement.style.cursor = 'default';
      return;
    }

    this.domElement.style.cursor = this.isDragging ? 'grabbing' : 'grab';
  }
}
