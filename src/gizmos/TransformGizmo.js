import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

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

    this.controls = new TransformControls(this.camera, this.domElement);
    this.controls.setSize(1.15);
    this.controls.enabled = false;
    this.controlsHelper = this.controls.getHelper ? this.controls.getHelper() : this.controls;
    this.controlsHelper.visible = false;
    this.sceneModule.scene.add(this.controlsHelper);

    this.controls.addEventListener('dragging-changed', (event) => {
      this.cameraController.setBloqueado(event.value);
    });

    this.outline = this.crearOutline();
    this.outline.visible = false;
    this.sceneModule.scene.add(this.outline);

    this.jumboGizmo = this.crearJumboGizmo();
    this.jumboGizmo.visible = false;
    this.sceneModule.scene.add(this.jumboGizmo);
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

    if (mode === 'select') {
      this.ocultarControls();
      this.ocultarJumboGizmo();
      this.actualizarCursor();
      return;
    }

    this.controls.setMode(this.obtenerModoTransform(mode));

    if (this.selectedObject) {
      this.mostrarControls(this.selectedObject.mesh);
      this.mostrarJumboGizmo();
    } else {
      this.ocultarControls();
      this.ocultarJumboGizmo();
    }

    this.actualizarCursor();
  }

  onPointerDown(event) {
    if (event.pointerType === 'touch' && event.isPrimary === false) return;
    if (this.controls.dragging) return;

    this.actualizarPointer(event);
    const objetoTocado = this.buscarObjeto();

    if (this.mode === 'select') {
      this.seleccionar(objetoTocado);
      return;
    }

    if (objetoTocado) {
      this.seleccionar(objetoTocado);
    }

    if (!this.selectedObject || !objetoTocado) return;

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
  }

  onPointerMove(event) {
    if (!this.isDragging || !this.selectedObject) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.mode === 'move') this.mover(event);
    if (this.mode === 'rotate') this.rotar(event);
    if (this.mode === 'scale') this.escalar(event);
  }

  onPointerUp(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;
    this.cameraController.setBloqueado(false);
  }

  seleccionar(gameObject) {
    this.selectedObject = gameObject;
    this.outline.visible = Boolean(gameObject);

    if (!gameObject) {
      this.ocultarControls();
      this.ocultarJumboGizmo();
      this.actualizarOutline();
      return;
    }

    if (this.mode !== 'select') {
      this.controls.setMode(this.obtenerModoTransform(this.mode));
      this.mostrarControls(gameObject.mesh);
      this.mostrarJumboGizmo();
    } else {
      this.ocultarControls();
      this.ocultarJumboGizmo();
    }

    this.actualizarOutline();
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

  mostrarControls(mesh) {
    this.controls.attach(mesh);
    this.controls.enabled = true;
    this.controlsHelper.visible = true;
  }

  ocultarControls() {
    this.controls.detach();
    this.controls.enabled = false;
    this.controlsHelper.visible = false;
  }

  obtenerModoTransform(mode) {
    if (mode === 'rotate') return 'rotate';
    if (mode === 'scale') return 'scale';
    return 'translate';
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

  crearJumboGizmo() {
    const group = new THREE.Group();
    group.name = 'Jumbo Visual Gizmo';

    const xMat = new THREE.MeshBasicMaterial({ color: 0xff4a4a, depthTest: false });
    const yMat = new THREE.MeshBasicMaterial({ color: 0x45ff6a, depthTest: false });
    const zMat = new THREE.MeshBasicMaterial({ color: 0x3a8cff, depthTest: false });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });

    const arrowGeo = new THREE.ConeGeometry(0.16, 0.42, 16);
    const lineGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.45, 12);
    const boxGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const ringGeo = new THREE.TorusGeometry(1.25, 0.035, 10, 80);

    const createArrow = (axis, material) => {
      const shaft = new THREE.Mesh(lineGeo, material);
      const head = new THREE.Mesh(arrowGeo, material);

      if (axis === 'x') {
        shaft.rotation.z = Math.PI / 2;
        shaft.position.x = 0.75;
        head.rotation.z = -Math.PI / 2;
        head.position.x = 1.55;
      }

      if (axis === 'y') {
        shaft.position.y = 0.75;
        head.position.y = 1.55;
      }

      if (axis === 'z') {
        shaft.rotation.x = Math.PI / 2;
        shaft.position.z = 0.75;
        head.rotation.x = Math.PI / 2;
        head.position.z = 1.55;
      }

      const arrow = new THREE.Group();
      arrow.add(shaft, head);
      arrow.userData.mode = 'move';
      return arrow;
    };

    group.add(createArrow('x', xMat));
    group.add(createArrow('y', yMat));
    group.add(createArrow('z', zMat));

    const ringY = new THREE.Mesh(ringGeo, yMat);
    ringY.name = 'Rotate Ring Y';
    group.add(ringY);

    const ringX = new THREE.Mesh(ringGeo, xMat);
    ringX.rotation.y = Math.PI / 2;
    ringX.name = 'Rotate Ring X';
    group.add(ringX);

    const ringZ = new THREE.Mesh(ringGeo, zMat);
    ringZ.rotation.x = Math.PI / 2;
    ringZ.name = 'Rotate Ring Z';
    group.add(ringZ);

    const scaleA = new THREE.Mesh(boxGeo, whiteMat);
    scaleA.position.set(1.35, 1.35, 1.35);
    group.add(scaleA);

    const scaleB = new THREE.Mesh(boxGeo, whiteMat);
    scaleB.position.set(-1.35, 1.35, -1.35);
    group.add(scaleB);

    return group;
  }

  mostrarJumboGizmo() {
    this.jumboGizmo.visible = Boolean(this.selectedObject && this.mode !== 'select');
    this.actualizarJumboGizmo();
  }

  ocultarJumboGizmo() {
    this.jumboGizmo.visible = false;
  }

  actualizarJumboGizmo() {
    if (!this.selectedObject) return;

    const box = new THREE.Box3().setFromObject(this.selectedObject.mesh);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const escala = Math.max(size.x, size.y, size.z, 1) * 0.85;
    this.jumboGizmo.position.copy(center);
    this.jumboGizmo.scale.setScalar(escala);
  }

  actualizarOutline() {
    if (!this.selectedObject) {
      this.outline.visible = false;
      this.ocultarJumboGizmo();
      return;
    }

    const box = new THREE.Box3().setFromObject(this.selectedObject.mesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    this.outline.visible = true;
    this.outline.position.copy(center);
    this.outline.rotation.set(0, 0, 0);
    this.outline.scale.set(size.x, size.y, size.z);
    this.actualizarJumboGizmo();
  }

  actualizarCursor() {
    this.domElement.style.cursor = this.mode === 'select' ? 'default' : 'grab';
  }
}
