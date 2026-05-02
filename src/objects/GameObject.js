export class GameObject {
  constructor({ id, nombre, tipo, mesh }) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.mesh = mesh;

    this.visible = true;
    this.position = mesh.position;
    this.rotation = mesh.rotation;
    this.scale = mesh.scale;
  }

  setVisible(visible) {
    this.visible = visible;
    this.mesh.visible = visible;
  }
}
