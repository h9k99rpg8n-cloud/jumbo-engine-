import { JumboEngine } from './motor/JumboEngine.js';
import './styles.css';

const app = document.querySelector('#app');

const engine = new JumboEngine({
  contenedor: app,
  nombre: 'Jumbo Engine',
  version: 'Web Alpha 0.1',
});

engine.iniciar();
