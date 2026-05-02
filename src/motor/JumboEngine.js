import * as THREE from 'three';

export class JumboEngine {
  constructor({ contenedor, nombre, version }) {
    this.contenedor = contenedor;
    this.nombre = nombre;
    this.version = version;

    this.escena = null;
    this.camara = null;
    this.render = null;
    this.cubo = null;
    this.reloj = new THREE.Clock();
  }

  iniciar() {
    this.crearInterfaz();
    this.crearMundo3D();
    this.crearEventos();
    this.loop();
  }

  crearInterfaz() {
    this.contenedor.innerHTML = `
      <main class="jumbo-shell">
        <header class="jumbo-header">
          <section>
            <h1>${this.nombre}</h1>
            <p>${this.version} · Motor web mobile-first</p>
          </section>
          <button class="jumbo-btn" id="btnAgregarCubo">+ Cubo</button>
        </header>

        <section class="jumbo-layout">
          <aside class="jumbo-panel jumbo-hierarchy">
            <h2>Jerarquía</h2>
            <button class="item active">🌍 Mundo</button>
            <button class="item">🧊 Cubo Jumbo</button>
            <button class="item">💡 Luz Principal</button>
            <button class="item">📷 Cámara</button>
          </aside>

          <section class="jumbo-viewport" id="viewport3D"></section>

          <aside class="jumbo-panel jumbo-inspector">
            <h2>Inspector</h2>
            <p class="label">Objeto seleccionado</p>
            <strong>Cubo Jumbo</strong>
            <p class="label">Motor</p>
            <span>Three.js + WebGL</span>
            <p class="label">Estado</p>
            <span class="status">Activo</span>
          </aside>
        </section>

        <footer class="jumbo-toolbar">
          <button>Mover</button>
          <button>Rotar</button>
          <button>Escalar</button>
          <button>Luz</button>
          <button>Cámara</button>
        </footer>
      </main>
    `;
  }

  crearMundo3D() {
    const viewport = document.querySelector('#viewport3D');
    const ancho = viewport.clientWidth;
    const alto = viewport.clientHeight;

    this.escena = new THREE.Scene();
    this.escena.background = new THREE.Color('#05070d');

    this.camara = new THREE.PerspectiveCamera(70, ancho / alto, 0.1, 1000);
    this.camara.position.set(0, 1.8, 5);
    this.camara.lookAt(0, 0, 0);

    this.render = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.render.setSize(ancho, alto);
    viewport.appendChild(this.render.domElement);

    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.45);
    this.escena.add(luzAmbiente);

    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 1.4);
    luzPrincipal.position.set(3, 5, 4);
    this.escena.add(luzPrincipal);

    const grid = new THREE.GridHelper(8, 16, 0x2f7dff, 0x1a2540);
    grid.position.y = -1;
    this.escena.add(grid);

    const geometria = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3aa0ff,
      metalness: 0.25,
      roughness: 0.32,
    });

    this.cubo = new THREE.Mesh(geometria, material);
    this.cubo.name = 'Cubo Jumbo';
    this.escena.add(this.cubo);
  }

  crearEventos() {
    window.addEventListener('resize', () => this.redimensionar());

    document.querySelector('#btnAgregarCubo').addEventListener('click', () => {
      const geometria = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const material = new THREE.MeshStandardMaterial({ color: 0x82ffb8 });
      const cuboNuevo = new THREE.Mesh(geometria, material);
      cuboNuevo.position.set(Math.random() * 3 - 1.5, Math.random() * 1.5, Math.random() * 3 - 1.5);
      this.escena.add(cuboNuevo);
    });
  }

  redimensionar() {
    const viewport = document.querySelector('#viewport3D');
    const ancho = viewport.clientWidth;
    const alto = viewport.clientHeight;

    this.camara.aspect = ancho / alto;
    this.camara.updateProjectionMatrix();
    this.render.setSize(ancho, alto);
  }

  loop() {
    requestAnimationFrame(() => this.loop());

    const tiempo = this.reloj.getElapsedTime();
    this.cubo.rotation.x = tiempo * 0.45;
    this.cubo.rotation.y = tiempo * 0.65;

    this.render.render(this.escena, this.camara);
  }
}
