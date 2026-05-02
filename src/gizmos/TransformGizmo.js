import * as THREE from 'three';

export class TransformGizmo {
  constructor({ camera, domElement, sceneModule, cameraController }) {
    this.camera = camera;
    this.domElement = domElement;
    this.sceneModule = sceneModule;
    this.cameraController = cameraController;

    this.mode = 'select';
    this.selectedObject = null;
    this.isDragging = false;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.hitPoint = new THREE.Vector3();
    this.dragOffset = new THREE.Vector3();

    this.startX = 0;
    this.startY = 0;
    this.startRotationY = 0;
    this.startScale = new THREE.Vector3(1, 1, 1);

    this.outline = this.crearOutline();
    this.outline.visible = false;
    this.sceneModule.scene.add(this.outline);
  }

  iniciar() {
    this.domElement.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    this.domElement.addEventListener('pointermove', (event) => this.onPointerMove(event));
    this.domElement.addEventListener('pointerup', (event) => this.onPointerUp(event));
    this.domElement.addEventListener('pointercancel', (event) => this.onPointerUp(event));
  }

  setMode(mode) {
    this.mode = mode;
    this.isDragging = false;
    this.cameraController.setBloqueado(false);
    this.actualizarCursor();
  }

  onPointerDown(event) {
    if (event.pointerType === 'touch' && event.isPrimary === false) return;

    this.actualizarPointer(event);
    const objetoTocado = this.buscarObjeto();

    if (this.mode === 'select') {
      this.seleccionar(objetoTocado);
      return;
    }

    if (objetoTocado) {
      this.seleccionar(objetoTocado);
    }

    if (!this.selectedObject) return;

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
    this.cameraController.setBloqueado(true);
    this.domElement.setPointerCapture?.(event.pointerId);

    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startRotationY = this.selectedObject.mesh.rotation.y;
    this.startScale.copy(this.selectedObject.mesh.scale);

    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.hitPoint)) {
      this.dragOffset.copy(this.selectedObject.mesh.position).sub(this.hitPoint);
    }

    this.actualizarCursor();
  }

  onPointerMove(event) {
    if (!this.isDragging || !this.selectedObject) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.mode === 'move') {
      this.mover(event);
      return;
    }

    if (this.mode === 'rotate') {
      this.rotar(event);
      return;
    }

    if (this.mode === 'scale') {
      this.escalar(event);
    }
  }

  onPointerUp(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;
    this.cameraController.setBloqueado(false);
    this.actualizarCursor();
  }

  mover(event) {
    this.actualizarPointer(event);

    if (!this.raycaster.ray.intersectPlane(this.dragPlane, this.hitPoint)) return;

    const nextPosition = this.hitPoint.clone().add(this.dragOffset);
    nextPosition.y = this.selectedObject.mesh.position.y;
    this.selectedObject.mesh.position.copy(nextPosition);
    this.actualizarOutline();
  }

  rotar(event) {
    const deltaX = event.clientX - this.startX;
    this.selectedObject.mesh.rotation.y = this.startRotationY + deltaX * 0.015;
    this.actualizarOutline();
  }

  escalar(event) {
    const deltaY = this.startY - event.clientY;
    const factor = THREE.MathUtils.clamp(1 + deltaY * 0.01, 0.2, 6);
    this.selectedObject.mesh.scale.copy(this.startScale).multiplyScalar(factor);
    this.actualizarOutline();
  }

  seleccionar(gameObject) {
    this.selectedObject = gameObject;
    this.outline.visible = Boolean(gameObject);
    this.actualizarOutline();
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

  crearOutline() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0x2f7dff });
    return new THREE.LineSegments(edges, material);
  }

  actualizarOutline() {
    if (!this.selectedObject) return;

    const box = new THREE.Box3().setFromObject(this.selectedObject.mesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    this.outline.position.copy(center);
    this.outline.rotation.copy(this.selectedObject.mesh.rotation);
    this.outline.scale.set(size.x, size.y, size.z);
  }

  actualizarCursor() {
    if (this.mode === 'select') {
      this.domElement.style.cursor = 'default';
      return;
    }

    this.domElement.style.cursor = this.isDragging ? 'grabbing' : 'grab';
  }
}
