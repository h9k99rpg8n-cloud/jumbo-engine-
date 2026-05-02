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
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.controls = new TransformControls(this.camera, this.domElement);
    this.controls.setSize(1.05);
    this.controls.visible = false;
    this.controls.enabled = false;

    this.sceneModule.scene.add(this.controls);

    this.controls.addEventListener('dragging-changed', (event) => {
      this.cameraController.setBloqueado(event.value);
    });

    this.controls.addEventListener('change', () => {
      this.actualizarOutline();
    });

    this.outline = this.crearOutline();
    this.outline.visible = false;
    this.sceneModule.scene.add(this.outline);
  }

  iniciar() {
    this.domElement.addEventListener('pointerdown', (event) => this.onPointerDown(event));
  }

  setMode(mode) {
    this.mode = mode;

    if (mode === 'select') {
      this.controls.detach();
      this.controls.visible = false;
      this.controls.enabled = false;
      this.cameraController.setBloqueado(false);
      this.actualizarCursor();
      return;
    }

    const transformMode = this.obtenerModoTransform(mode);
    this.controls.setMode(transformMode);
    this.controls.visible = Boolean(this.selectedObject);
    this.controls.enabled = Boolean(this.selectedObject);

    if (this.selectedObject) {
      this.controls.attach(this.selectedObject.mesh);
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
  }

  seleccionar(gameObject) {
    this.selectedObject = gameObject;
    this.outline.visible = Boolean(gameObject);

    if (!gameObject) {
      this.controls.detach();
      this.controls.visible = false;
      this.controls.enabled = false;
      this.actualizarOutline();
      return;
    }

    if (this.mode !== 'select') {
      this.controls.attach(gameObject.mesh);
      this.controls.visible = true;
      this.controls.enabled = true;
      this.controls.setMode(this.obtenerModoTransform(this.mode));
    }

    this.actualizarOutline();
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

  actualizarOutline() {
    if (!this.selectedObject) {
      this.outline.visible = false;
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
  }

  actualizarCursor() {
    this.domElement.style.cursor = this.mode === 'select' ? 'default' : 'grab';
  }
}
